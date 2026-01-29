import path from 'path'

const projectRootDir = path.join(__dirname, '/../')
const dataDir = path.join(projectRootDir, 'data')

export const config = {

    port: 3000,

    projectRootDir,

    publicDir: path.join(projectRootDir, 'public'),

    uploadsDir: path.join(projectRootDir, 'uploads'),

    projectsDir: path.join(dataDir, 'projects.json'),

    layersJsonFileDir: path.join(dataDir, 'layers.json'),

    placementImagesJsonFileDir: path.join(dataDir, 'placement-images.json'),

    spriteModelsJsonFileDir: path.join(dataDir, 'sprite-models.json'),

    userDataFileDir: path.join(dataDir, 'user-data.json'),

    allowedExtensions: ['.png', '.jpg', '.jpeg', '.webp', '.svg'],

    fileUploadSizeLimit: '50mb',

}