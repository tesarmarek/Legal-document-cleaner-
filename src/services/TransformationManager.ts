// Rozhraní pro metadata
interface DocumentMetadata {
  originalContent: string;
  transformations: {
    styles: any[];
    headers: any[];
  };
  structure: {
    headers: HeaderInfo[];
    lists: ListInfo[];
  };
  documentStructure?: any;
}

interface HeaderInfo {
  level: number;
  text: string;
  customLevel?: number;
  element?: Element;
}

interface ListInfo {
  id: string;
  number: string;
  text: string;
}

// Třída pro správu stylů
class StyleManager {
  private doc: Document;

  constructor(doc: Document) {
    this.doc = doc;
  }

  removeStyleTags(): void {
    const styleTags = this.doc.getElementsByTagName('style');
    while (styleTags.length > 0) {
      styleTags[0].remove();
    }
  }

  removeInlineStyles(): void {
    const elementsWithStyle = this.doc.querySelectorAll('[style]');
    elementsWithStyle.forEach(element => {
      element.removeAttribute('style');
    });
  }

  addBasicStyles(): void {
    const head = this.doc.querySelector('head');
    if (head) {
      const style = this.doc.createElement('style');
      style.textContent = `
        .paragraph-number {
          font-weight: bold;
          margin-right: 5px;
        }
        ol {
          list-style-type: none;
          padding-left: 0;
        }
        ol ol {
          padding-left: 20px;
        }
      `;
      head.appendChild(style);
    }
  }
}

// Třída pro správu nadpisů
class HeaderManager {
  private doc: Document;
  private metadata: DocumentMetadata;

  constructor(doc: Document, metadata: DocumentMetadata) {
    this.doc = doc;
    this.metadata = metadata;
  }

  findHeaderById(id: string): Element | null {
    return this.doc.getElementById(id);
  }

  findHeaderByText(level: number, text: string): Element | null {
    const headers = this.doc.querySelectorAll(`h${level}`);
    for (let i = 0; i < headers.length; i++) {
      if (headers[i].textContent?.trim() === text.trim()) {
        return headers[i];
      }
    }
    return null;
  }

  transformHeader(targetHeader: Element, proposedLevel: number): void {
    const newHeader = this.doc.createElement(`h${proposedLevel}`);
    newHeader.textContent = targetHeader.textContent;
    
    Array.from(targetHeader.attributes).forEach(attr => {
      if (attr.name !== 'data-header-level') {
        newHeader.setAttribute(attr.name, attr.value);
      }
    });
    
    newHeader.setAttribute('data-header-level', proposedLevel.toString());
    targetHeader.parentNode?.replaceChild(newHeader, targetHeader);
  }
}

// Třída pro správu seznamů
class ListManager {
  private doc: Document;

  constructor(doc: Document) {
    this.doc = doc;
  }

  preserveParagraphNumbering(): void {
    const lists = this.doc.querySelectorAll('ol');
    lists.forEach(list => {
      const items = list.querySelectorAll('li');
      items.forEach(item => {
        const existingSpans = item.querySelectorAll('span.paragraph-number');
        existingSpans.forEach(span => span.remove());
        
        const originalListText = item.getAttribute('data-list-text');
        if (originalListText && /^\d+\.?\d*$/.test(originalListText)) {
          const numberSpan = this.doc.createElement('span');
          numberSpan.className = 'paragraph-number';
          numberSpan.textContent = originalListText + ' ';
          
          if (item.firstChild) {
            item.insertBefore(numberSpan, item.firstChild);
          } else {
            item.appendChild(numberSpan);
          }
        }
      });
    });
  }
}

// Hlavní třída TransformationManager
export class TransformationManager {
  private metadata: DocumentMetadata = {
    originalContent: '',
    transformations: {
      styles: [],
      headers: []
    },
    structure: {
      headers: [],
      lists: []
    }
  };

  private generateUniqueId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private enhanceHtmlStructure(doc: Document): void {
    // Zpracování sekcí a nadpisů
    const sections = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    sections.forEach((section, index) => {
      const level = parseInt(section.tagName.substring(1));
      const sectionId = this.generateUniqueId('section');
      const sectionElement = doc.createElement('section');
      sectionElement.id = sectionId;
      sectionElement.setAttribute('data-section-level', level.toString());
      sectionElement.setAttribute('data-section-title', section.textContent || '');
      
      // Přesun obsahu do sekce
      let nextElement = section.nextElementSibling;
      while (nextElement && !nextElement.matches('h1, h2, h3, h4, h5, h6')) {
        const currentElement = nextElement;
        nextElement = nextElement.nextElementSibling;
        sectionElement.appendChild(currentElement);
      }
      
      section.parentNode?.insertBefore(sectionElement, section);
      sectionElement.insertBefore(section, sectionElement.firstChild);
    });

    // Zpracování seznamů
    const lists = doc.querySelectorAll('ol, ul');
    lists.forEach(list => {
      const listId = this.generateUniqueId('list');
      list.id = listId;
      list.setAttribute('data-list-type', list.tagName.toLowerCase() === 'ol' ? 'numbered' : 'bulleted');
      
      const items = list.querySelectorAll('li');
      items.forEach((item, index) => {
        const itemId = this.generateUniqueId('item');
        item.id = itemId;
        const listText = item.getAttribute('data-list-text');
        if (listText) {
          item.setAttribute('data-item-number', listText);
        }
      });
    });

    // Zpracování odstavců
    const paragraphs = doc.querySelectorAll('p');
    paragraphs.forEach(paragraph => {
      const paragraphId = this.generateUniqueId('p');
      paragraph.id = paragraphId;
      const parentItem = paragraph.closest('li');
      if (parentItem) {
        const itemNumber = parentItem.getAttribute('data-list-text');
        if (itemNumber) {
          paragraph.setAttribute('data-paragraph-number', itemNumber);
        }
      }
    });
  }

  private generateDocumentStructure(doc: Document): any {
    const structure = {
      document: {
        metadata: {
          title: doc.title || 'Bez názvu',
          version: '1.0',
          lastModified: new Date().toISOString()
        },
        structure: {
          sections: [] as any[]
        }
      }
    };

    const sections = doc.querySelectorAll('section');
    sections.forEach(section => {
      const sectionData = {
        id: section.id,
        htmlId: section.id,
        title: section.getAttribute('data-section-title') || '',
        level: parseInt(section.getAttribute('data-section-level') || '1'),
        content: [] as any[],
        subsections: [] as any[]
      };

      // Zpracování obsahu sekce
      Array.from(section.children).forEach(child => {
        if (child.matches('h1, h2, h3, h4, h5, h6')) {
          // Nadpis je již součástí metadat sekce
          return;
        }

        if (child.matches('ol, ul')) {
          const listData = {
            type: 'list',
            id: child.id,
            htmlId: child.id,
            listType: child.getAttribute('data-list-type'),
            items: [] as any[]
          };

          const items = child.querySelectorAll('li');
          items.forEach(item => {
            const itemData = {
              id: item.id,
              htmlId: item.id,
              number: item.getAttribute('data-list-text') || '',
              text: item.textContent || '',
              path: this.getElementPath(item)
            };
            listData.items.push(itemData);
          });

          sectionData.content.push(listData);
        } else if (child.matches('p')) {
          const paragraphData = {
            type: 'paragraph',
            id: child.id,
            htmlId: child.id,
            number: child.getAttribute('data-paragraph-number') || '',
            text: child.textContent || '',
            path: this.getElementPath(child)
          };
          sectionData.content.push(paragraphData);
        }
      });

      structure.document.structure.sections.push(sectionData);
    });

    return structure;
  }

  private getElementPath(element: Element): string {
    const path: string[] = [];
    let currentElement: Element | null = element;
    
    while (currentElement && currentElement !== document.body) {
      if (currentElement.id) {
        path.unshift(currentElement.id);
      }
      currentElement = currentElement.parentElement;
    }
    
    return path.join(' > ');
  }

  analyzeContent(): void {
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.metadata.originalContent, 'text/html');
    
    this.enhanceHtmlStructure(doc);
    this.analyzeDocumentStructure(doc);
    this.analyzeLists(doc);
    this.metadata.documentStructure = this.generateDocumentStructure(doc);
  }

  private analyzeLists(doc: Document): void {
    // Najít všechny seznamy
    const lists = doc.querySelectorAll('ol');
    lists.forEach(list => {
      const listId = list.getAttribute('id') || '';
      
      // Najít všechny položky seznamu
      const items = list.querySelectorAll('li');
      items.forEach(item => {
        const listText = item.getAttribute('data-list-text') || '';
        const text = item.textContent || '';
        
        // Uložíme informace o číslování do metadat
        this.metadata.structure.lists.push({
          id: listId,
          number: listText,
          text: text.trim()
        });
        
        // Pokud položka obsahuje vnořený seznam, analyzujeme i jeho položky
        const nestedList = item.querySelector('ol');
        if (nestedList) {
          const nestedItems = nestedList.querySelectorAll('li');
          nestedItems.forEach(nestedItem => {
            const nestedListText = nestedItem.getAttribute('data-list-text') || '';
            const nestedText = nestedItem.textContent || '';
            
            this.metadata.structure.lists.push({
              id: nestedList.getAttribute('id') || '',
              number: nestedListText,
              text: nestedText.trim()
            });
          });
        }
      });
    });
  }

  private analyzeDocumentStructure(doc: Document): void {
    const headers = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headerStructure: { level: number, text: string, customLevel?: number }[] = [];
    
    headers.forEach(header => {
      const level = parseInt(header.tagName.substring(1)); // h1 -> 1, h2 -> 2, atd.
      const text = header.textContent || '';
      
      headerStructure.push({
        level,
        text,
        customLevel: level // Výchozí vlastní úroveň je stejná jako aktuální
      });
    });
    
    // Uložení do transformací
    this.metadata.transformations.headers = headerStructure.map((header, index) => {
      // Najdeme odpovídající element v dokumentu
      const headerElements = doc.querySelectorAll(`h${header.level}`);
      let matchingElement = null;
      
      for (let i = 0; i < headerElements.length; i++) {
        if (headerElements[i].textContent?.trim() === header.text.trim()) {
          matchingElement = headerElements[i];
          break;
        }
      }
      
      return {
        element: matchingElement,
        preview: `h${header.level}: ${header.text}`,
        currentLevel: header.level,
        proposedLevel: header.customLevel
      };
    });
    
    this.metadata.structure.headers = headerStructure;
  }
  
  private getHeaderIndex(doc: Document, level: number, text: string): number {
    const headers = doc.querySelectorAll(`h${level}`);
    for (let i = 0; i < headers.length; i++) {
      if (headers[i].textContent?.trim() === text.trim()) {
        return i + 1;
      }
    }
    return 1;
  }

  updateHeaderLevel(index: number, newLevel: number): void {
    if (this.metadata.structure.headers[index]) {
      this.metadata.structure.headers[index].customLevel = newLevel;
      
      if (this.metadata.transformations.headers[index]) {
        this.metadata.transformations.headers[index].proposedLevel = newLevel;
      }
    }
  }

  applyTransformations(transformations: string[]): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.metadata.originalContent, 'text/html');
    
    const styleManager = new StyleManager(doc);
    styleManager.removeStyleTags();
    styleManager.removeInlineStyles();
    
    const headerManager = new HeaderManager(doc, this.metadata);
    const headersToTransform: { targetHeader: Element, proposedLevel: number }[] = [];
    
    transformations.forEach(transformId => {
      if (transformId.startsWith('header-')) {
        const index = parseInt(transformId.split('-')[1]);
        const headerInfo = this.metadata.transformations.headers[index];
        
        if (headerInfo && headerInfo.element) {
          const currentLevel = headerInfo.currentLevel;
          let proposedLevel = currentLevel;
          if (headerInfo.proposedLevel) {
            if (typeof headerInfo.proposedLevel === 'number') {
              proposedLevel = headerInfo.proposedLevel;
            } else if (typeof headerInfo.proposedLevel === 'object' && 'value' in headerInfo.proposedLevel) {
              proposedLevel = headerInfo.proposedLevel.value;
            }
          }
          
          const headerText = headerInfo.element.textContent?.trim() || '';
          let targetHeader: Element | null = null;
          
          if (headerInfo.element.id) {
            targetHeader = headerManager.findHeaderById(headerInfo.element.id);
          }
          
          if (!targetHeader) {
            targetHeader = headerManager.findHeaderByText(currentLevel, headerText);
          }
          
          if (targetHeader) {
            headersToTransform.push({ targetHeader, proposedLevel });
          }
        }
      }
    });
    
    headersToTransform.forEach(({ targetHeader, proposedLevel }) => {
      headerManager.transformHeader(targetHeader, proposedLevel);
    });

    const listManager = new ListManager(doc);
    listManager.preserveParagraphNumbering();
    
    styleManager.addBasicStyles();

    return doc.documentElement.outerHTML;
  }

  getMetadata(): any {
    return this.metadata;
  }

  setOriginalContent(content: string): void {
    this.metadata.originalContent = content;
  }

  private generateInteractiveJson(doc: Document): any {
    const structure = {
      document: {
        metadata: {
          title: doc.title || 'Bez názvu',
          version: '1.0',
          lastModified: new Date().toISOString()
        },
        structure: {
          sections: [] as any[]
        }
      }
    };

    const sections = doc.querySelectorAll('section');
    sections.forEach(section => {
      const sectionData = {
        id: section.id,
        htmlId: section.id,
        title: section.getAttribute('data-section-title') || '',
        level: parseInt(section.getAttribute('data-section-level') || '1'),
        content: [] as any[],
        subsections: [] as any[],
        path: this.getElementPath(section),
        element: section.outerHTML
      };

      // Zpracování obsahu sekce
      Array.from(section.children).forEach(child => {
        if (child.matches('h1, h2, h3, h4, h5, h6')) {
          const headerData = {
            type: 'header',
            id: child.id,
            htmlId: child.id,
            level: parseInt(child.tagName.substring(1)),
            text: child.textContent || '',
            path: this.getElementPath(child),
            element: child.outerHTML
          };
          sectionData.content.push(headerData);
        } else if (child.matches('ol, ul')) {
          const listData = {
            type: 'list',
            id: child.id,
            htmlId: child.id,
            listType: child.getAttribute('data-list-type'),
            items: [] as any[],
            path: this.getElementPath(child),
            element: child.outerHTML
          };

          const items = child.querySelectorAll('li');
          items.forEach(item => {
            const itemData = {
              id: item.id,
              htmlId: item.id,
              number: item.getAttribute('data-list-text') || '',
              text: item.textContent || '',
              path: this.getElementPath(item),
              element: item.outerHTML
            };
            listData.items.push(itemData);
          });

          sectionData.content.push(listData);
        } else if (child.matches('p')) {
          const paragraphData = {
            type: 'paragraph',
            id: child.id,
            htmlId: child.id,
            number: child.getAttribute('data-paragraph-number') || '',
            text: child.textContent || '',
            path: this.getElementPath(child),
            element: child.outerHTML
          };
          sectionData.content.push(paragraphData);
        }
      });

      structure.document.structure.sections.push(sectionData);
    });

    return structure;
  }

  getInteractiveJson(): any {
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.metadata.originalContent, 'text/html');
    return this.generateInteractiveJson(doc);
  }

  findElementByPath(path: string): Element | null {
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.metadata.originalContent, 'text/html');
    const pathParts = path.split(' > ');
    
    let currentElement: Element | null = doc.body;
    for (const part of pathParts) {
      if (!currentElement) return null;
      currentElement = currentElement.querySelector(`#${part}`);
    }
    
    return currentElement;
  }
} 