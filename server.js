require('dotenv').config();
const express = require('express');
const multer = require('multer');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');
const https = require('https');
const http = require('http');
const os = require('os');
const fs = require('fs');
const selfsigned = require('selfsigned');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3000;
const HTTP_PORT = 3001;

app.set('trust proxy', true);

// ──────────────────────────────────────────────
// Supabase 클라이언트 초기화
// ──────────────────────────────────────────────
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ .env 파일에 SUPABASE_URL과 SUPABASE_KEY를 설정해주세요!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ──────────────────────────────────────────────
// Multer 설정 (메모리 스토리지)
// ──────────────────────────────────────────────
const memoryStorage = multer.memoryStorage();

const uploadPhoto = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('이미지 파일만 업로드 가능합니다.'));
  }
});

const uploadFrame = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('이미지 파일만 업로드 가능합니다.'));
  }
});

// ──────────────────────────────────────────────
// 미들웨어
// ──────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ──────────────────────────────────────────────
// API 라우트 - 사진
// ──────────────────────────────────────────────

// Helper: Supabase 스토리지 파일 업로드
async function uploadBufferToSupabase(bucket, filename, buffer, contentType) {
  const { data, error } = await supabase
    .storage
    .from(bucket)
    .upload(filename, buffer, {
      contentType: contentType,
      upsert: false
    });

  if (error) throw error;
  return data;
}

// 사진 업로드 (합성된 네컷사진 - 파일 폼데이터)
app.post('/api/upload', uploadPhoto.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '파일이 없습니다.' });
    }

    const id = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10분 후
    const ext = path.extname(req.file.originalname) || '.jpg';
    const filename = `${id}${ext}`;

    // 0. 로컬 PC에 저장
    try {
      const localDir = path.join(__dirname, 'local_photos');
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir);
      }
      const localPath = path.join(localDir, filename);
      fs.writeFileSync(localPath, req.file.buffer);
      console.log(`💾 로컬 디스크에 저장 완료: ${localPath}`);
    } catch (fsErr) {
      console.error('로컬 저장 실패:', fsErr);
    }

    // 1. Storage 업로드
    await uploadBufferToSupabase('booth-uploads', filename, req.file.buffer, req.file.mimetype);

    // 2. DB Insert
    const { error: dbError } = await supabase
      .from('photos')
      .insert([{
        id,
        filename,
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString()
      }]);

    if (dbError) throw dbError;

    // QR코드 생성
    const serverUrl = getServerUrl(req);
    const downloadUrl = `${serverUrl}/download.html?id=${id}`;
    const qrDataUrl = await QRCode.toDataURL(downloadUrl, {
      width: 300, margin: 2, color: { dark: '#000000', light: '#ffffff' }
    });

    console.log(`📸 새 사진 저장 (Supabase): ${id} (만료: ${expiresAt.toLocaleTimeString('ko-KR')})`);

    res.json({ id, qrCode: qrDataUrl, downloadUrl, expiresAt: expiresAt.toISOString() });
  } catch (error) {
    console.error('업로드 에러:', error);
    res.status(500).json({ error: '업로드 실패' });
  }
});

// ──────────────────────────────────────────────
// 로컬 자동 백업 (원하는 모든 사진을 강제 저장)
// ──────────────────────────────────────────────
app.post('/api/save-local', async (req, res) => {
  try {
    const { image, prefix } = req.body;
    if (!image) return res.status(400).json({ error: '이미지 데이터가 없습니다.' });

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // YYYYMMDD_HHMMSS 포맷 생성
    const now = new Date();
    const dateStr = now.toISOString().replace(/T/, '_').replace(/:/g, '').split('.')[0];
    const ms = now.getMilliseconds();
    
    const filename = `${prefix || 'photo'}_${dateStr}_${ms}.jpg`;
    
    const localDir = path.join(__dirname, 'local_photos');
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir);
    }
    const localPath = path.join(localDir, filename);
    fs.writeFileSync(localPath, buffer);
    console.log(`💾 로컬 디스크 백업 완료: ${filename}`);
    
    res.json({ success: true, filename });
  } catch (err) {
    console.error('로컬 자동 백업 실패:', err);
    res.status(500).json({ error: '로컬 백업 실패' });
  }
});

// Base64로 사진 업로드 (Canvas에서 직접 전송)
app.post('/api/upload-base64', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: '이미지 데이터가 없습니다.' });
    }

    const id = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);
    const filename = `${id}.jpg`;

    // Base64 → Buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // 0. 로컬 PC에 저장
    try {
      const localDir = path.join(__dirname, 'local_photos');
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir);
      }
      const localPath = path.join(localDir, filename);
      fs.writeFileSync(localPath, buffer);
      console.log(`💾 로컬 디스크에 저장 완료: ${localPath}`);
    } catch (fsErr) {
      console.error('로컬 저장 실패:', fsErr);
    }

    // 1. Storage 업로드
    await uploadBufferToSupabase('booth-uploads', filename, buffer, 'image/jpeg');

    // 2. DB Insert
    const { error: dbError } = await supabase
      .from('photos')
      .insert([{
        id,
        filename,
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString()
      }]);

    if (dbError) throw dbError;

    // QR코드 생성
    const serverUrl = getServerUrl(req);
    const downloadUrl = `${serverUrl}/download.html?id=${id}`;
    const qrDataUrl = await QRCode.toDataURL(downloadUrl, {
      width: 300, margin: 2, color: { dark: '#000000', light: '#ffffff' }
    });

    console.log(`📸 새 사진 저장 (Supabase): ${id} (만료: ${expiresAt.toLocaleTimeString('ko-KR')})`);

    res.json({ id, qrCode: qrDataUrl, downloadUrl, expiresAt: expiresAt.toISOString() });
  } catch (error) {
    console.error('업로드 에러:', error);
    res.status(500).json({ error: '업로드 실패' });
  }
});

// 사진 정보 조회
app.get('/api/photo/:id', async (req, res) => {
  try {
    const { data: photo, error } = await supabase
      .from('photos')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !photo) {
      return res.status(404).json({ error: '사진을 찾을 수 없습니다.', expired: true });
    }

    const now = new Date();
    const expired = now > new Date(photo.expires_at);
    if (expired) {
      return res.status(410).json({ error: '다운로드 기간이 만료되었습니다.', expired: true });
    }

    // 사진의 Public URL 가져오기
    const { data: publicUrlData } = supabase
      .storage
      .from('booth-uploads')
      .getPublicUrl(photo.filename);

    res.json({
      id: photo.id,
      filename: photo.filename,
      createdAt: photo.created_at,
      expiresAt: photo.expires_at,
      expired: false,
      imageUrl: publicUrlData.publicUrl
    });
  } catch (err) {
    res.status(500).json({ error: '서버 오류' });
  }
});

// 사진 다운로드
app.get('/api/download/:id', async (req, res) => {
  try {
    const { data: photo, error } = await supabase
      .from('photos')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !photo) {
      return res.status(404).json({ error: '사진을 찾을 수 없습니다.' });
    }

    const now = new Date();
    if (now > new Date(photo.expires_at)) {
      return res.status(410).json({ error: '다운로드 기간이 만료되었습니다.' });
    }

    // Storage에서 파일 버퍼로 다운로드
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('booth-uploads')
      .download(photo.filename);

    if (downloadError || !fileData) {
      return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
    }

    // 버퍼로 변환 후 전송
    const buffer = Buffer.from(await fileData.arrayBuffer());
    res.setHeader('Content-Type', fileData.type || 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="photo-booth-${Date.now()}.jpg"`);
    res.send(buffer);

  } catch (err) {
    console.error('다운로드 오류:', err);
    res.status(500).json({ error: '다운로드 실패' });
  }
});

// ──────────────────────────────────────────────
// API 라우트 - 프레임
// ──────────────────────────────────────────────

// 프레임 업로드
app.post('/api/frames', uploadFrame.single('frame'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '파일이 없습니다.' });
    }

    const id = uuidv4();
    const name = req.body.name || '커스텀 프레임';
    const ext = path.extname(req.file.originalname) || '.png';
    const filename = `${id}${ext}`;

    // 1. Storage 업로드
    await uploadBufferToSupabase('booth-frames', filename, req.file.buffer, req.file.mimetype);

    // 2. DB Insert
    const { error: dbError } = await supabase
      .from('frames')
      .insert([{
        id,
        name,
        filename,
        created_at: new Date().toISOString()
      }]);

    if (dbError) throw dbError;

    const { data: publicUrlData } = supabase
      .storage
      .from('booth-frames')
      .getPublicUrl(filename);

    console.log(`🖼️ 프레임 추가 (Supabase): ${name} (${id})`);

    res.json({
      id,
      name,
      imageUrl: publicUrlData.publicUrl
    });
  } catch (error) {
    console.error('프레임 업로드 에러:', error);
    res.status(500).json({ error: '프레임 업로드 실패' });
  }
});

// 프레임 목록
app.get('/api/frames', async (req, res) => {
  try {
    const { data: frames, error } = await supabase
      .from('frames')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const result = frames.map(frame => {
      const { data: publicUrlData } = supabase
        .storage
        .from('booth-frames')
        .getPublicUrl(frame.filename);
        
      return {
        id: frame.id,
        name: frame.name,
        imageUrl: publicUrlData.publicUrl
      };
    });

    res.json(result);
  } catch (err) {
    console.error('프레임 목록 조회 오류:', err);
    res.status(500).json({ error: '프레임 목록 조회 실패' });
  }
});

// 프레임 삭제
app.delete('/api/frames/:id', async (req, res) => {
  try {
    // 1. 파일명 조회
    const { data: frame } = await supabase
      .from('frames')
      .select('filename, name')
      .eq('id', req.params.id)
      .single();

    if (frame) {
      // 2. Storage 파일 삭제
      await supabase.storage.from('booth-frames').remove([frame.filename]);
    }

    // 3. DB 레코드 삭제
    const { error } = await supabase
      .from('frames')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    console.log(`🗑️ 프레임 삭제 (Supabase): ${frame ? frame.name : req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    console.error('프레임 삭제 오류:', err);
    res.status(500).json({ error: '프레임 삭제 실패' });
  }
});

// ──────────────────────────────────────────────
// 10분 만료 스케줄러 (Supabase 연동)
// ──────────────────────────────────────────────
setInterval(async () => {
  try {
    const now = new Date().toISOString();
    
    // 1. 만료된 사진 조회
    const { data: expiredPhotos, error: fetchError } = await supabase
      .from('photos')
      .select('id, filename')
      .lt('expires_at', now);

    if (fetchError || !expiredPhotos || expiredPhotos.length === 0) return;

    const fileNames = expiredPhotos.map(p => p.filename);
    const ids = expiredPhotos.map(p => p.id);

    // 2. Storage 삭제
    if (fileNames.length > 0) {
      await supabase.storage.from('booth-uploads').remove(fileNames);
    }

    // 3. DB 삭제
    if (ids.length > 0) {
      await supabase.from('photos').delete().in('id', ids);
    }

    console.log(`🗑️ 만료된 사진 ${expiredPhotos.length}장 삭제 (Supabase 정리 완료)`);

  } catch (err) {
    console.error('만료 스케줄러 오류:', err);
  }
}, 60 * 1000); // 1분마다 체크

// ──────────────────────────────────────────────
// 서버 URL 감지
// ──────────────────────────────────────────────
function getServerUrl(req) {
  // ngrok 등 프록시의 X-Forwarded 헤더 우선 사용
  const forwardedProto = req.headers['x-forwarded-proto'];
  const forwardedHost = req.headers['x-forwarded-host'] || req.headers['x-original-host'];

  if (forwardedHost) {
    const protocol = forwardedProto || 'https';
    return `${protocol}://${forwardedHost}`;
  }

  const protocol = req.secure ? 'https' : 'http';
  const host = req.headers.host || `${getLocalIP()}:${PORT}`;
  return `${protocol}://${host}`;
}

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// ──────────────────────────────────────────────
// HTTPS 자체 서명 인증서 + 서버 시작
// ──────────────────────────────────────────────
function startServer() {
  const localIP = getLocalIP();

  // 자체 서명 인증서 생성
  console.log('🔐 HTTPS 인증서 생성 중...');
  const attrs = [{ name: 'commonName', value: localIP }];
  const pems = selfsigned.generate(attrs, {
    algorithm: 'sha256',
    days: 1,
    keySize: 2048,
    extensions: [
      {
        name: 'subjectAltName',
        altNames: [
          { type: 2, value: 'localhost' },
          { type: 7, ip: '127.0.0.1' },
          { type: 7, ip: localIP }
        ]
      }
    ]
  });

  // HTTPS 서버
  const httpsServer = https.createServer(
    { key: pems.private, cert: pems.cert },
    app
  );

  // HTTP 서버 (ngrok 및 직접 접속용 - 앱 동일 서빙)
  const httpServer = http.createServer(app);

  httpsServer.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║          📸 네컷사진 부스 서버 시작! 📸              ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log(`║  🖥️  로컬:    https://localhost:${PORT}                ║`);
    console.log(`║  📱 네트워크: https://${localIP}:${PORT}         ║`);
    console.log(`║  🌐 HTTP:    http://localhost:${HTTP_PORT} (ngrok용)    ║`);
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log('║  💡 모바일 접속: ngrok http ' + HTTP_PORT + ' 실행 후        ║');
    console.log('║     생성된 URL로 접속하세요                          ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');
  });

  httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
    console.log(`🌐 HTTP 서버: http://${localIP}:${HTTP_PORT}`);
  }).on('error', () => {
    // HTTP 포트 사용 불가 시 무시
  });
}

startServer();
