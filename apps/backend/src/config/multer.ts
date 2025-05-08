import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Certifica se o diretório de uploads existe
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configura o armazenamento dos arquivos
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const fileExtension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
  },
});

// Configura o filtro de arquivos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Permite apenas arquivos PDF, PNG, JPEG e WEBP
  const allowedMimeTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Apenas PDF, PNG e JPEG são aceitos.'));
  }
};

// Cria opção de upload
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // limite de 5MB 
  },
  fileFilter,
});

export const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const avatarDir = path.join(uploadsDir, 'avatars');
      if (!fs.existsSync(avatarDir)) {
        fs.mkdirSync(avatarDir, { recursive: true });
      }
      cb(null, avatarDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
      const fileExtension = path.extname(file.originalname);
      cb(null, `avatar-${uniqueSuffix}${fileExtension}`);
    },
  }),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas para avatar'));
    }
  },
});