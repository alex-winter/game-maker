import path from 'path'

const projectRootDir = path.join(__dirname, '/../')
const dataDir = path.join(projectRootDir, 'data')

export const config = {

    port: 3000,

    projectRootDir,

    publicDir: path.join(projectRootDir, 'public'),

    uploadsDir: path.join(projectRootDir, 'uploads'),

    uploadsIndexFileDir: path.join(projectRootDir, 'uploads', 'index.json'),

    projectFileDir: path.join(dataDir, 'project.json'),

    /** Read once, when `project.json` does not exist yet, to import old paintings. */
    legacyLayersJsonFileDir: path.join(dataDir, 'layers.json'),

    placementImagesJsonFileDir: path.join(dataDir, 'placement-images.json'),

    userDataFileDir: path.join(dataDir, 'user-data.json'),

    /** The play session's one save slot (T-041). */
    saveFileDir: path.join(dataDir, 'save.json'),

    allowedExtensions: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],

    fileUploadSizeLimit: '50mb',

}