export class FileManager {
  private file: File | null = null;
  private originalContent: string = '';
  public storagePath: string = '';

  async setFile(file: File): Promise<void> {
    this.file = file;
    this.originalContent = await this.readFile(file);
    this.storagePath = this.calculateStoragePath(file.name);
  }

  private async readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private calculateStoragePath(fileName: string): string {
    const baseName = fileName.replace(/\.[^/.]+$/, "");
    return `html_cleaner/${baseName}/`;
  }

  async saveFile(content: string, metadata: any): Promise<void> {
    if (!this.file) throw new Error('Není vybrán žádný soubor');

    const directoryHandle = await this.getDirectoryHandle();
    if (!directoryHandle) throw new Error('Nepodařilo se získat přístup k složce');

    const fileName = await this.generateFileName(directoryHandle);
    const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
    
    const writable = await fileHandle.createWritable();
    await writable.write(this.createFileContent(content, metadata));
    await writable.close();
  }

  private async getDirectoryHandle() {
    try {
      // @ts-ignore - FileSystem API types are not yet available
      const rootHandle = await window.showDirectoryPicker({
        id: 'html-cleaner-storage',
        mode: 'readwrite'
      });

      const selectedPath = rootHandle.name.toLowerCase();
      const fileName = this.file!.name.toLowerCase();

      if (selectedPath.includes(fileName) || selectedPath === 'html_cleaner') {
        return rootHandle;
      }

      return await this.createDirectoryStructure(rootHandle);
    } catch (error) {
      console.error('Chyba při získávání složky:', error);
      return null;
    }
  }

  private async createDirectoryStructure(rootHandle: FileSystemDirectoryHandle) {
    const htmlCleanerHandle = await rootHandle.getDirectoryHandle('html_cleaner', { create: true });
    const baseName = this.file!.name.replace(/\.[^/.]+$/, "");
    return await htmlCleanerHandle.getDirectoryHandle(baseName, { create: true });
  }

  private createFileContent(content: string, metadata: any): string {
    const doc = document.implementation.createHTMLDocument();
    const metadataScript = doc.createElement('script');
    metadataScript.textContent = `window.fileMetadata = ${JSON.stringify(metadata)};`;
    doc.head.appendChild(metadataScript);
    doc.body.innerHTML = content;
    return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
  }

  private async generateFileName(directoryHandle: FileSystemDirectoryHandle): Promise<string> {
    const baseName = this.file!.name.replace(/\.[^/.]+$/, "");
    let counter = 1;
    let fileName = `${baseName}_cleaned.html`;
    
    while (true) {
      try {
        await directoryHandle.getFileHandle(fileName);
        fileName = `${baseName}_cleaned_${counter}.html`;
        counter++;
      } catch {
        return fileName;
      }
    }
  }
} 