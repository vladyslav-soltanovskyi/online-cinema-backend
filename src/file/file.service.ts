import { Injectable } from '@nestjs/common';
import { path } from 'app-root-path';
import { ensureDir, writeFile } from 'fs-extra';
import { FileResponse } from './dto/file.dto';

@Injectable()
export class FileService {
    async saveFiles(files: Express.Multer.File[], folder: string = 'default'): Promise<FileResponse[]> {
        const uploadedFolder = `${path}/uploads/${folder}`;
        await ensureDir(uploadedFolder);

        const res: FileResponse[] = await Promise.all(
            files.map(async file => {
                await writeFile(`${uploadedFolder}/${file.originalname}`, file.buffer);
                return {
                    url: `/uploads/${folder}/${file.originalname}`,
                    name: file.originalname
                }
            })
        );
        
        return res;
    }
}
