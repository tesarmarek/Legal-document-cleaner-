<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          HTML Cleaner
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <div class="row q-col-gutter-md">
          <!-- Levý sloupec - Transformace -->
          <div class="col-12 col-md-4">
            <q-card class="transformations-card">
              <q-card-section>
                <div class="text-h6">Transformace</div>
              </q-card-section>

              <q-card-section>
                <q-file
                  v-model="file"
                  label="Vyberte HTML soubor"
                  filled
                  accept=".html,.htm"
                  @update:model-value="handleFileUpload"
                >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file>

                <q-btn
                  color="primary"
                  label="Aplikovat změny"
                  class="q-mt-md full-width"
                  @click="applyTransformations"
                  :disable="!file"
                />

                <div v-if="lastSavedFile" class="q-mt-md">
                  <div class="text-caption text-grey">
                    Poslední uložený soubor:
                  </div>
                  <div class="row items-center">
                    <div class="text-body2 text-weight-medium">
                      {{ lastSavedFile }}
                    </div>
                    <q-btn
                      color="primary"
                      icon="download"
                      flat
                      dense
                      class="q-ml-sm"
                      @click="downloadFile"
                      :disable="!lastSavedFileUrl"
                    />
                  </div>
                  <q-btn
                    color="secondary"
                    label="Otevřít v prohlížeči"
                    class="q-mt-sm full-width"
                    @click="openInBrowser"
                    :disable="!lastSavedFileUrl"
                  />
                </div>
              </q-card-section>

              <q-card-section>
                <q-expansion-item
                  group="transformations"
                  icon="format_header_1"
                  label="Nadpisy"
                  header-class="text-primary"
                  default-opened
                >
                  <q-card>
                    <q-card-section>
                      <div v-if="transformations.headers.length === 0" class="text-grey text-center q-pa-md">
                        Nebyly nalezeny žádné nadpisy
                      </div>
                      <div v-else>
                        <div class="row items-center q-mb-md">
                          <div class="col-12">
                            <q-select
                              v-model="defaultHeaderLevel"
                              :options="getHeaderLevelOptions(1)"
                              dense
                              class="col-4"
                              label="Výchozí úroveň nadpisů"
                              @update:model-value="updateAllHeaderLevels"
                            />
                          </div>
                        </div>
                        <div v-for="(header, index) in transformations.headers" :key="'header-' + index" class="q-mb-sm">
                          <div class="row items-center no-wrap q-mb-xs">
                            <q-checkbox
                              v-model="selectedTransformations.headers[index]"
                              class="q-mr-sm"
                            />
                            <div class="text-subtitle2 text-weight-medium ellipsis">
                              {{ header.preview.split(':')[1]?.trim() || 'Bez textu' }}
                            </div>
                          </div>
                          <div class="row items-center q-ml-md">
                            <q-select
                              v-model="header.proposedLevel"
                              :options="getHeaderLevelOptions(header.currentLevel)"
                              dense
                              class="col-4"
                              :label="'Úroveň nadpisu'"
                              @update:model-value="updateHeaderLevel(index, $event)"
                            />
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>

                <q-expansion-item
                  group="transformations"
                  icon="style"
                  label="Styly"
                  header-class="text-primary"
                >
                  <q-card>
                    <q-card-section>
                      <q-checkbox
                        v-for="(style, index) in transformations.styles"
                        :key="'style-' + index"
                        v-model="selectedTransformations.styles[index]"
                        :label="style.preview"
                      />
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </q-card-section>
            </q-card>
          </div>

          <!-- Pravý sloupec - Náhled -->
          <div class="col-12 col-md-8">
            <q-card class="preview-card">
              <q-card-section class="row items-center">
                <div class="text-h6">Náhled</div>
                <q-space />
                <q-btn-toggle
                  v-model="activeTab"
                  :options="[
                    { label: 'Původní', value: 'original' },
                    { label: 'Transformovaný', value: 'transformed' }
                  ]"
                />
              </q-card-section>

              <q-card-section>
                <div v-if="activeTab === 'original' && originalContent" class="preview-content">
                  <div class="row items-center q-mb-sm">
                    <q-btn
                      :icon="isOriginalHtmlPreview ? 'web' : 'code'"
                      :label="isOriginalHtmlPreview ? 'Zobrazit jako web' : 'Zobrazit jako HTML'"
                      color="primary"
                      flat
                      @click="isOriginalHtmlPreview = !isOriginalHtmlPreview"
                    />
                  </div>
                  <pre v-if="isOriginalHtmlPreview">{{ originalContent }}</pre>
                  <div v-else v-html="originalContent"></div>
                </div>
                <div v-else-if="activeTab === 'transformed' && transformedContent" class="preview-content">
                  <div class="row items-center q-mb-sm">
                    <q-btn
                      :icon="isTransformedHtmlPreview ? 'web' : 'code'"
                      :label="isTransformedHtmlPreview ? 'Zobrazit jako web' : 'Zobrazit jako HTML'"
                      color="primary"
                      flat
                      @click="isTransformedHtmlPreview = !isTransformedHtmlPreview"
                    />
                  </div>
                  <pre v-if="isTransformedHtmlPreview">{{ transformedContent }}</pre>
                  <div v-else v-html="transformedContent"></div>
                </div>
                <div v-else class="text-grey text-center q-pa-md">
                  Vyberte HTML soubor pro náhled
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { TransformationManager } from '../services/TransformationManager';

export default defineComponent({
  name: 'HtmlCleaner',
  setup() {
    const file = ref<File | null>(null);
    const originalContent = ref<string>('');
    const transformedContent = ref<string>('');
    const lastSavedFile = ref<string>('');
    const lastSavedFileUrl = ref<string>('');
    const activeTab = ref<'original' | 'transformed'>('original');
    const isOriginalHtmlPreview = ref<boolean>(true);
    const isTransformedHtmlPreview = ref<boolean>(true);
    const transformationManager = new TransformationManager();
    const transformations = ref({
      styles: [] as { preview: string }[],
      headers: [] as { preview: string }[]
    });
    const selectedTransformations = ref({
      styles: [] as boolean[],
      headers: [] as boolean[]
    });
    const defaultHeaderLevel = ref<number>(1);

    const handleFileUpload = async (file: File) => {
      if (!file) return;
      
      const content = await file.text();
      originalContent.value = content;
      transformedContent.value = ''; // Reset transformovaného obsahu
      transformationManager.setOriginalContent(content);
      transformationManager.analyzeContent();
      
      const metadata = transformationManager.getMetadata();
      console.log('Metadata po analýze:', metadata);
      
      transformations.value = {
        styles: metadata.transformations.styles.map(s => ({ preview: s.preview })),
        headers: metadata.transformations.headers.map(h => ({ 
          preview: h.preview,
          currentLevel: h.currentLevel,
          proposedLevel: h.proposedLevel || h.currentLevel
        }))
      };
      
      // Všechny transformace jsou vybrané ve výchozím stavu
      selectedTransformations.value = {
        styles: new Array(transformations.value.styles.length).fill(true),
        headers: new Array(transformations.value.headers.length).fill(true)
      };
      
      console.log('Načtené nadpisy:', transformations.value.headers);
    };

    const getNextVersion = (baseName: string): string => {
      // Najdi všechny existující soubory s podobným názvem
      const files = document.querySelectorAll('a[download]');
      let maxVersion = 0;
      
      files.forEach(file => {
        const fileName = file.getAttribute('download') || '';
        if (fileName.startsWith(baseName)) {
          const match = fileName.match(/_v(\d+)\.html$/);
          if (match) {
            const version = parseInt(match[1]);
            if (version > maxVersion) {
              maxVersion = version;
            }
          }
        }
      });
      
      return `${baseName}_v${maxVersion + 1}.html`;
    };

    const applyTransformations = () => {
      const selectedStyles = transformations.value.styles
        .map((_, index) => selectedTransformations.value.styles[index] ? `style-${index}` : null)
        .filter(Boolean) as string[];
        
      const selectedHeaders = transformations.value.headers
        .map((_, index) => selectedTransformations.value.headers[index] ? `header-${index}` : null)
        .filter(Boolean) as string[];
      
      console.log('Vybrané transformace:', [...selectedStyles, ...selectedHeaders]);
      console.log('Transformace nadpisů:', transformations.value.headers);
      
      // Předání transformací do TransformationManager
      const result = transformationManager.applyTransformations([...selectedStyles, ...selectedHeaders]);
      transformedContent.value = result;
      
      // Získání základního názvu souboru bez přípony
      const baseFileName = file.value?.name.replace(/\.html?$/, '') || 'cleaned';
      
      // Získání názvu souboru s verzí
      const fileName = getNextVersion(baseFileName);
      lastSavedFile.value = fileName;
      
      // Vytvoření URL pro stažení
      const blob = new Blob([result], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      lastSavedFileUrl.value = url;
      
      // Přepnout na transformovaný obsah
      activeTab.value = 'transformed';
    };

    const downloadFile = () => {
      if (lastSavedFileUrl.value && lastSavedFile.value) {
        const a = document.createElement('a');
        a.href = lastSavedFileUrl.value;
        a.download = lastSavedFile.value;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    };

    const openInBrowser = () => {
      if (lastSavedFileUrl.value) {
        window.open(lastSavedFileUrl.value, '_blank');
      }
    };

    const getHeaderLevelOptions = (currentLevel: number) => {
      // Vytvoříme pole možností pro úrovně nadpisů (H1-H4)
      const options = [];
      for (let i = 1; i <= 4; i++) {
        options.push({
          label: `H${i}`,
          value: i
        });
      }
      return options;
    };

    const updateHeaderLevel = (index: number, newLevel: number) => {
      transformationManager.updateHeaderLevel(index, newLevel);
    };

    const updateAllHeaderLevels = (newLevel: number) => {
      transformations.value.headers.forEach((header, index) => {
        header.proposedLevel = newLevel;
        transformationManager.updateHeaderLevel(index, newLevel);
      });
    };

    return {
      file,
      originalContent,
      transformedContent,
      lastSavedFile,
      lastSavedFileUrl,
      activeTab,
      isOriginalHtmlPreview,
      isTransformedHtmlPreview,
      transformations,
      selectedTransformations,
      defaultHeaderLevel,
      handleFileUpload,
      applyTransformations,
      openInBrowser,
      downloadFile,
      updateHeaderLevel,
      updateAllHeaderLevels,
      getHeaderLevelOptions
    };
  }
});
</script>

<style scoped>
.transformations-card {
  position: sticky;
  top: 20px;
}

.preview-card {
  height: calc(100vh - 100px);
}

.preview-content {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
}

.preview-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style> 