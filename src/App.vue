<script setup>
import { ref, reactive } from 'vue';
import axios from 'axios';
import { saveAs } from 'file-saver';
import InputText from 'primevue/inputtext';
import ColorPicker from 'primevue/colorpicker';
import Button from 'primevue/button';
import { QrCode, Download, Copy, Check, FileText, Sparkles, AlertCircle } from 'lucide-vue-next';

const API_BASE = import.meta.env.VITE_API_URL;

// --- State ---
const loading = ref(false);
const qrPreview = ref(null);
const fileName = ref('qr-code');
const copied = ref(false);
const errorMessage = ref('');

const form = reactive({
  url: '',
  size: 600,
  color: '000000',
  bg_color: 'ffffff', 
});

// --- Methods ---
const generateSingle = async () => {
  if (!form.url) return;
  loading.value = true;
  errorMessage.value = '';
  
  try {
    const formData = new FormData();
    formData.append('url', form.url);
    formData.append('size', form.size);
    formData.append('color', form.color);
    formData.append('bg_color', form.bg_color);

    const res = await axios.post(`${API_BASE}/generate`, formData, { 
      responseType: 'blob' 
    });
    
    if (qrPreview.value) URL.revokeObjectURL(qrPreview.value);
    qrPreview.value = URL.createObjectURL(res.data);
  } catch (err) {
    errorMessage.value = "Connection failed. Please check your backend.";
    setTimeout(() => errorMessage.value = '', 4000);
  } finally {
    loading.value = false;
  }
};

const downloadQR = () => {
  if (qrPreview.value) {
    const finalName = fileName.value.trim() || 'qr-code';
    saveAs(qrPreview.value, `${finalName}.png`);
  }
};

const copyToClipboard = async () => {
  if (!qrPreview.value || copied.value) return;
  try {
    const response = await fetch(qrPreview.value);
    const blob = await response.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type]: blob })
    ]);
    
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    errorMessage.value = "Failed to copy to clipboard.";
    setTimeout(() => errorMessage.value = '', 3000);
  }
};
</script>

<template>
  <div class="min-h-screen w-full bg-[#1c1c1c] text-slate-200 font-sans p-4 md:p-8 lg:p-12 relative overflow-x-hidden selection:bg-[#3ecf8e]/30">
    
    <Transition name="slide-fade">
      <div v-if="errorMessage" class="fixed top-6 right-6 z-50 flex items-center gap-3 bg-red-950/50 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl backdrop-blur-md shadow-2xl">
        <AlertCircle :size="20" />
        <span class="font-bold text-sm">{{ errorMessage }}</span>
      </div>
    </Transition>

    <div class="max-w-7xl mx-auto">
      <header class="flex items-center justify-between mb-16 border-b border-white/5 pb-8">
        <div class="flex items-center gap-4">
          <div class="p-2.5 bg-[#3ecf8e] rounded-lg">
            <QrCode class="text-[#1c1c1c] w-7 h-7" />
          </div>
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              QR Studio <span class="px-2 py-0.5 rounded text-[10px] bg-white/10 text-white/60 tracking-widest uppercase">PRO</span>
            </h1>
            
          </div>
        </div>
        
      </header>

      <div class="grid lg:grid-cols-12 gap-12 items-start">
        
        <aside class="lg:col-span-5 space-y-6">
          <div class="bg-[#232323] p-8 rounded-2xl shadow-2xl border border-white/5 relative overflow-hidden">
            <h2 class="text-xs font-bold uppercase text-[#3ecf8e] mb-8 flex items-center gap-2 tracking-widest">
              <Sparkles :size="14" />
              Customization
            </h2>
            
            <div class="space-y-8">
              <div class="space-y-3">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Destination</label>
                <InputText 
                  v-model="form.url" 
                  placeholder="https://example.com" 
                  class="w-full bg-[#1c1c1c] px-5 py-4 rounded-xl border border-white/5 hover:border-white/10 focus:border-[#3ecf8e] focus:ring-0 outline-none transition-all duration-300 text-slate-400 font-light placeholder:text-slate-600" 
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="p-4 bg-[#1c1c1c] rounded-xl border border-white/5">
                  <label class="text-[10px] font-black uppercase text-slate-500 block mb-3">QR Color</label>
                  <div class="flex items-center gap-3">
                    <ColorPicker v-model="form.color" />
                    <span class="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">#{{ form.color }}</span>
                  </div>
                </div>
                <div class="p-4 bg-[#1c1c1c] rounded-xl border border-white/5">
                  <label class="text-[10px] font-black uppercase text-slate-500 block mb-3">Background</label>
                  <div class="flex items-center gap-3">
                    <ColorPicker v-model="form.bg_color" />
                    <span class="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">#{{ form.bg_color }}</span>
                  </div>
                </div>
              </div>

              <Button 
                @click="generateSingle" 
                :disabled="!form.url || loading"
                class="w-full py-4 rounded-xl bg-[#3ecf8e] hover:bg-[#34b27b] text-[#1c1c1c] font-bold shadow-lg shadow-green-900/20 transition-all duration-200 flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div v-if="loading" class="w-4 h-4 border-2 border-[#1c1c1c]/30 border-t-[#1c1c1c] rounded-full animate-spin"></div>
                <span class="tracking-wide">{{ loading ? 'Generating...' : 'Create QR Code' }}</span>
              </Button>
            </div>
          </div>
        </aside>

        <section class="lg:col-span-7">
          <div class="bg-[#232323] rounded-3xl border border-white/5 p-6 md:p-12 min-h-[580px] flex flex-col items-center justify-center relative overflow-hidden">
            
            <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 30px 30px;"></div>

            <div v-if="qrPreview" class="w-full max-w-md space-y-8 animate-in relative z-10">
              <div class="bg-[#1c1c1c] p-10 rounded-2xl shadow-2xl border border-white/5 relative group">
                <img :src="qrPreview" class="w-full aspect-square object-contain rounded-lg" alt="QR Preview" />
                
                <div class="absolute top-4 right-4 flex gap-2">
                  <button 
                    @click="copyToClipboard" 
                    :class="[copied ? 'bg-[#3ecf8e] text-[#1c1c1c]' : 'bg-[#232323] text-slate-400 hover:text-white border border-white/10']"
                    class="p-3 shadow-xl rounded-xl transition-all duration-300 active:scale-95"
                  >
                    <Check v-if="copied" :size="18" />
                    <Copy v-else :size="18" />
                  </button>
                </div>
              </div>
              
              <div class="space-y-3">
                <div class="flex gap-3 bg-[#1c1c1c] p-2 rounded-xl border border-white/5">
                  <div class="relative flex-1 flex items-center bg-transparent">
                    <InputText 
                      v-model="fileName"
                      placeholder="filename" 
                      class="w-full bg-transparent border-none py-3 px-3 focus:ring-0 text-sm font-light text-slate-400"
                    />
                  </div>
                  <Button 
                    @click="downloadQR" 
                    class="bg-white/5 hover:bg-white/10 text-white px-6 rounded-lg font-bold flex items-center gap-2 border border-white/10 transition-all active:scale-95"
                  >
                    <Download :size="16" />
                    <span class="text-xs">Export</span>
                  </Button>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center space-y-8 p-12 relative z-10">
                <div class="relative inline-block">
                    <div class="w-24 h-24 bg-[#3ecf8e]/5 border border-[#3ecf8e]/10 rounded-2xl flex items-center justify-center mx-auto rotate-6 animate-pulse">
                        <QrCode class="w-10 h-10 text-[#3ecf8e]" />
                    </div>
                </div>
                <div class="max-w-xs mx-auto">
                  <h3 class="text-2xl font-bold text-white mb-3">Generate instantly</h3>
                  
                  <p class="text-slate-500 text-sm leading-relaxed font-light">
                    Enter URL, customize colors, download HD QR.
                  </p>
                </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* Reset PrimeVue Styles */
:deep(.p-inputtext) {
  background-color: transparent !important;
  box-shadow: none !important;
  border-width: 0.5px !important;
  border-color: gray !important;
  color: white !important;
  font-weight: 300 !important; 
}

:deep(.p-inputtext:enabled:hover),
:deep(.p-inputtext:enabled:focus) {
  background-color: transparent !important;
}

/* Custom Thin Border logic */
.relative.flex-1.flex.items-center {
  @apply bg-[#1c1c1c] border border-white/5 rounded-xl transition-all duration-300;
}

.relative.flex-1.flex.items-center:focus-within {
  @apply border-[#3ecf8e]/50 ring-1 ring-[#3ecf8e]/10;
}

/* Animations */
.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.4s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.animate-in {
  animation: animate-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes animate-in {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>