import React, { useState, useEffect } from 'react';
import {
  Download,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  UploadCloud,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  FileCheck,
  ArrowRight,
  Bell,
  Lock,
  Zap,
  FolderUp,
  X,
  RotateCcw,
} from 'lucide-react';
import { DownloadAnimationModal } from './DownloadAnimationModal';

interface ResultViewProps {
  score: number;
  correctCount: number;
  incorrectCount: number;
  kkm: number;
  studentName: string;
  noPeserta: string;
  driveUploadUrl?: string;
  onDownloadEncryptedResult: () => void;
  onViewDiscussion?: () => void;
  onRestart: () => void;
}

// Gentle audio chime for positive attention without loud alarm
const playChimeSound = (isSuccess = false) => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (!isSuccess) {
      // Warm attention chime (D5 -> A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.12);
      gain2.gain.setValueAtTime(0.15, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.65);
    } else {
      // Celebratory success chord (C5 -> E5 -> G5)
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.14, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.5);
      });
    }
  } catch (e) {
    // Autoplay restrictions are gracefully ignored
  }
};

export const ResultView: React.FC<ResultViewProps> = ({
  score,
  correctCount,
  incorrectCount,
  kkm,
  studentName,
  noPeserta,
  driveUploadUrl,
  onDownloadEncryptedResult,
  onRestart,
}) => {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [showMandatoryAlertModal, setShowMandatoryAlertModal] = useState(true);
  const [showExitWarningModal, setShowExitWarningModal] = useState(false);

  const storageKey = `cbt_has_downloaded_${noPeserta.replace(/[^a-zA-Z0-9]/g, '_')}`;

  const [hasDownloaded, setHasDownloaded] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem(storageKey) === 'true';
      } catch (e) {}
    }
    return false;
  });

  const cleanName = studentName.replace(/[^a-zA-Z0-9]/g, '_');
  const resultFileName = `HASIL_CBT_${noPeserta}_${cleanName}.cbt`;
  const isPassed = score >= kkm;

  useEffect(() => {
    // Play attention chime when entering ResultView if not already downloaded
    if (!hasDownloaded) {
      playChimeSound(false);
    }
  }, []);

  const handleStartDownload = () => {
    setShowMandatoryAlertModal(false);
    setShowExitWarningModal(false);
    setIsDownloadModalOpen(true);
  };

  const handleDownloadCompleted = () => {
    setHasDownloaded(true);
    try {
      sessionStorage.setItem(storageKey, 'true');
    } catch (e) {}
    playChimeSound(true);
  };

  const handleExitAttempt = () => {
    if (!hasDownloaded) {
      setShowExitWarningModal(true);
      playChimeSound(false);
    } else {
      onRestart();
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/90 fixed inset-0 z-40 overflow-y-auto p-3 sm:p-6 custom-scrollbar">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in p-5 sm:p-8 text-center relative border border-slate-100 my-auto space-y-6">
        {/* Dynamic Glow Accents */}
        <div className="absolute top-0 left-0 w-44 h-44 bg-emerald-400/10 rounded-br-full -z-10 blur-xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-44 h-44 bg-indigo-500/10 rounded-tl-full -z-10 blur-xl pointer-events-none" />

        {/* Top Header Badge & Greeting */}
        <div className="space-y-2">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>

          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3.5 py-1 rounded-full text-xs font-bold border border-emerald-200 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Ujian Selesai &amp; Jawaban Terenkripsi Aman
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Alhamdulillah, Ujian Selesai!
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm font-medium">
            Terima kasih <span className="font-extrabold text-slate-900">{studentName}</span> ({noPeserta})
          </p>
        </div>

        {/* Score & Evaluation Summary */}
        <div className="bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Perolehan Nilai Ujian
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
                {score}
              </span>
              <span className="text-xs font-bold text-slate-500">/ 100</span>
              <span
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                  isPassed
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}
              >
                {isPassed ? 'TUNTAS / LULUS KKM' : 'REMEDIAL'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs text-center">
              <span className="text-slate-400 text-[10px] block font-semibold">KKM</span>
              <span className="text-slate-800 font-mono text-sm">{kkm}</span>
            </div>
            <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs text-center">
              <span className="text-emerald-600 text-[10px] block font-semibold">Benar</span>
              <span className="text-emerald-700 font-mono text-sm">{correctCount}</span>
            </div>
            <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs text-center">
              <span className="text-rose-500 text-[10px] block font-semibold">Salah / Kosong</span>
              <span className="text-rose-600 font-mono text-sm">{incorrectCount}</span>
            </div>
          </div>
        </div>

        {/* MANDATORY WARNING STATUS BANNER (Eye-catching Animation) */}
        {!hasDownloaded ? (
          <div className="bg-gradient-to-r from-amber-500/15 via-red-500/10 to-amber-500/15 border-2 border-amber-400 p-4 rounded-2xl text-left space-y-2 relative overflow-hidden shadow-lg shadow-amber-500/10 animate-pulse">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-amber-950 font-black text-xs sm:text-sm">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-ping shrink-0" />
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>PERINGATAN WAJIB: ANDA BELUM DOWNLOAD JAWABAN!</span>
              </div>
              <span className="bg-red-600 text-white font-mono text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-bounce">
                WAJIB UNDUH
              </span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed font-semibold">
              Jangan langsung menutup aplikasi! Anda <b>wajib mengunduh berkas jawaban (.cbt)</b> pada Langkah 1 di bawah ini dan <b>mengunggahnya ke Google Drive Guru</b> pada Langkah 2 sebagai bukti resmi pengerjaan.
            </p>
          </div>
        ) : (
          <div className="bg-emerald-50 border-2 border-emerald-400 p-4 rounded-2xl text-left space-y-1.5 shadow-md shadow-emerald-500/10">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-emerald-900 font-black text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>BERKAS JAWABAN SUDAH BERHASIL DIUNDUH!</span>
              </div>
              <span className="bg-emerald-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                LANGKAH 1 SELESAI ✓
              </span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed font-medium">
              File <b className="font-mono text-emerald-950">{resultFileName}</b> telah tersimpan di HP/Laptop Anda. Sekarang lanjutkan ke <b>Langkah 2: Upload ke Google Drive</b> di bawah ini.
            </p>
          </div>
        )}

        {/* STEP-BY-STEP WORKFLOW CARDS */}
        <div className="space-y-4">
          {/* STEP 1: DOWNLOAD ENCRYPTED RESULT FILE */}
          <div
            className={`p-5 rounded-2xl text-left space-y-3 transition-all duration-300 relative overflow-hidden border ${
              !hasDownloaded
                ? 'bg-slate-900 text-white border-2 border-emerald-400 shadow-xl shadow-emerald-900/20'
                : 'bg-slate-900/95 text-white border-slate-700/80 shadow-md'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                    hasDownloaded
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-400 text-slate-950 animate-bounce'
                  }`}
                >
                  {hasDownloaded ? '✓' : '1'}
                </span>
                <p className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Langkah 1: Unduh Berkas Jawaban (.cbt)
                </p>
              </div>

              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold border ${
                  hasDownloaded
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                }`}
              >
                {hasDownloaded ? 'TERUNDUH ✓' : 'WAJIB KLIK'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Berkas <span className="font-mono text-emerald-300">.cbt</span> ini berisi rekaman jawaban Anda yang telah diamankan dengan enkripsi digital sebagai arsip resmi ujian offline.
            </p>

            <button
              type="button"
              onClick={handleStartDownload}
              className={`w-full font-black py-3.5 px-5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-95 cursor-pointer group ${
                !hasDownloaded
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-600/40 ring-4 ring-emerald-400/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700'
              }`}
            >
              <Download className={`w-4 h-4 transition-transform ${!hasDownloaded ? 'animate-bounce' : 'group-hover:translate-y-0.5'}`} />
              <span>
                {hasDownloaded
                  ? 'Unduh Ulang Berkas Jawaban (.cbt)'
                  : 'UNDUH FILE JAWABAN (.CBT) SEKARANG'}
              </span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </button>
          </div>

          {/* STEP 2: UPLOAD TO GOOGLE DRIVE */}
          {driveUploadUrl ? (
            <div
              className={`p-5 rounded-2xl text-left space-y-3 transition-all duration-300 border ${
                hasDownloaded
                  ? 'bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white border-2 border-indigo-400 shadow-xl shadow-indigo-900/30'
                  : 'bg-slate-800 text-white border-slate-700/80 opacity-95'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                      hasDownloaded
                        ? 'bg-indigo-500 text-white animate-bounce'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    2
                  </span>
                  <p className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <UploadCloud className="w-4 h-4 text-indigo-400" /> Langkah 2: Upload ke Google Drive Guru
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-indigo-400" />
              </div>

              <p className="text-xs text-indigo-200 leading-relaxed font-medium">
                {hasDownloaded ? (
                  <span className="text-emerald-300 font-bold">
                    👉 Langkah 1 telah selesai! Sekarang klik tombol di bawah untuk membuka folder Google Drive dan unggah file <span className="font-mono">{resultFileName}</span>.
                  </span>
                ) : (
                  <span>
                    Setelah mengunduh file <span className="font-mono text-indigo-300">.cbt</span> pada Langkah 1 di atas, unggah file tersebut ke folder Google Drive kelas yang disediakan Guru.
                  </span>
                )}
              </p>

              <a
                href={driveUploadUrl.startsWith('http') ? driveUploadUrl : `https://${driveUploadUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full font-black py-3.5 px-5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-95 cursor-pointer block text-center ${
                  hasDownloaded
                    ? 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-600/40 ring-4 ring-indigo-400/30 animate-pulse'
                    : 'bg-indigo-950/70 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/60'
                }`}
              >
                <UploadCloud className="w-4 h-4 shrink-0" />
                <span>Buka Google Drive &amp; Upload File Jawaban (.cbt)</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-80" />
              </a>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-left space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-black text-xs">
                  2
                </span>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FolderUp className="w-4 h-4 text-slate-500" /> Langkah 2: Penyerahan File ke Guru / Pengawas
                </p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tautan Google Drive belum disematkan pada paket ujian ini. Harap serahkan file <b>.cbt</b> yang telah diunduh kepada Guru/Pengawas melalui WhatsApp, flashdisk, atau Google Form yang ditentukan.
              </p>
            </div>
          )}
        </div>

        {/* Exit Application Button with Guard */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={handleExitAttempt}
            className={`w-full min-h-[50px] font-extrabold py-3.5 px-5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer active:scale-98 ${
              !hasDownloaded
                ? 'bg-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-700'
                : 'bg-slate-900 hover:bg-black text-white shadow-slate-900/20'
            }`}
          >
            <LogOut className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {hasDownloaded
                ? 'Selesai & Keluar dari Aplikasi (Kembali ke Halaman Login)'
                : 'Keluar dari Aplikasi (Peringatan Unduh Aktif)'}
            </span>
          </button>
          {!hasDownloaded && (
            <p className="text-[11px] text-amber-700 font-semibold">
              * Tombol keluar akan menampilkan konfirmasi jika Anda belum mengunduh berkas jawaban.
            </p>
          )}
        </div>

        {/* Footer Credit */}
        <p className="text-[11px] text-gray-400 pt-2 border-t border-slate-100">
          <span>create: </span>
          <a
            href="https://lynk.id/ajisosiologi"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline font-bold text-blue-600"
          >
            @ajisosiologi
          </a>{' '}
          - Offline Secure Assessment System v2.0
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 1. MANDATORY POST-EXAM REMINDER MODAL (ANIMATED POPUP UPON FINISH)       */}
      {/* ========================================================================= */}
      {showMandatoryAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in select-none">
          <div className="bg-white rounded-3xl shadow-2xl border-4 border-amber-400 w-full max-w-lg p-6 sm:p-8 text-center relative overflow-hidden space-y-5 animate-in zoom-in-95 duration-200">
            {/* Glowing Ambient Radial Glows */}
            <div className="absolute -top-16 -left-16 w-44 h-44 bg-amber-400/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-emerald-400/25 rounded-full blur-3xl pointer-events-none" />

            {/* Animated Header Icon Ring */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-amber-400 bg-amber-50 animate-spin" />
              <div className="relative z-10 w-14 h-14 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/40">
                <AlertTriangle className="w-8 h-8 animate-bounce" />
              </div>
              <div className="absolute -top-1 -right-1 bg-red-600 text-white p-1 rounded-full shadow-md animate-ping">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-1.5">
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                <Bell className="w-3 h-3 text-amber-700" /> PERINGATAN PENTING PASCA UJIAN
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                Wajib Download Berkas Jawaban &amp; Upload ke Google Drive!
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Selamat, <span className="font-bold text-slate-800">{studentName}</span>! Ujian Anda telah tuntas dengan skor <span className="font-bold font-mono text-emerald-600">{score}</span>. Jangan lupa lakukan 2 langkah wajib ini:
              </p>
            </div>

            {/* 2-Step Animated Cards */}
            <div className="space-y-2.5 text-left">
              {/* Step 1 Box */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl flex items-start gap-3 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs mt-0.5">
                  1
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-950 uppercase tracking-wide flex items-center gap-1">
                      <Download className="w-3.5 h-3.5 text-emerald-700" /> Unduh Berkas (.cbt)
                    </span>
                    <span className="bg-emerald-200 text-emerald-900 text-[10px] font-bold px-2 py-0.2 rounded-md font-mono">
                      WAJIB
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Download file terenkripsi <span className="font-mono font-bold text-emerald-950">.cbt</span> ke memori perangkat sebagai bukti sah pengerjaan ujian.
                  </p>
                </div>
              </div>

              {/* Step 2 Box */}
              <div className="p-3.5 bg-gradient-to-r from-indigo-50 to-sky-50 border-2 border-indigo-300 rounded-2xl flex items-start gap-3 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs mt-0.5">
                  2
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-950 uppercase tracking-wide flex items-center gap-1">
                      <UploadCloud className="w-3.5 h-3.5 text-indigo-700" /> Upload ke Google Drive
                    </span>
                    <span className="bg-indigo-200 text-indigo-900 text-[10px] font-bold px-2 py-0.2 rounded-md font-mono">
                      WAJIB
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-800 leading-relaxed">
                    {driveUploadUrl
                      ? 'Buka link Google Drive yang tersedia dan upload file .cbt Anda agar nilai dapat direkap oleh Guru.'
                      : 'Kirimkan berkas .cbt yang telah diunduh kepada Guru/Pengawas ujian sesuai arahan kelas.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleStartDownload}
                className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-3.5 px-6 rounded-2xl text-xs sm:text-sm transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 cursor-pointer ring-4 ring-emerald-400/40 animate-pulse"
              >
                <Download className="w-4 h-4 animate-bounce" />
                <span>DOWNLOAD FILE JAWABAN (.CBT) SEKARANG</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </button>

              <button
                type="button"
                onClick={() => setShowMandatoryAlertModal(false)}
                className="w-full py-2.5 text-slate-500 hover:text-slate-800 font-bold text-xs transition cursor-pointer"
              >
                Tutup Peringatan &amp; Tampilkan Rekap Nilai Lengkap
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EXIT WARNING GUARD MODAL (IF STUDENT ATTEMPTS TO EXIT BEFORE DOWNLOAD) */}
      {/* ========================================================================= */}
      {showExitWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in select-none">
          <div className="bg-white rounded-3xl shadow-2xl border-4 border-red-500 w-full max-w-md p-6 sm:p-7 text-center relative overflow-hidden space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-500/20">
              <AlertCircle className="w-9 h-9 text-red-600 animate-bounce" />
            </div>

            <div className="space-y-1">
              <span className="bg-red-100 text-red-900 border border-red-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                BERKAS BELUM DIUNDUH!
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                Yakin Ingin Keluar Tanpa Mengunduh?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Jika Anda keluar sekarang tanpa mengunduh berkas <span className="font-mono font-bold text-red-600">.cbt</span>, Anda tidak memiliki file cadangan offline untuk diunggah ke Google Drive Guru.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleStartDownload}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black py-3 px-4 rounded-xl text-xs sm:text-sm transition shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2 ring-2 ring-emerald-400/50"
              >
                <Download className="w-4 h-4 animate-bounce" />
                <span>Unduh File Jawaban Sekarang (Sangat Disarankan)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowExitWarningModal(false);
                  onRestart();
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-red-600 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
              >
                Tetap Keluar Tanpa Mengunduh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DOWNLOAD ANIMATION MODAL (ENCRYPTION & PACKAGING PROGRESS)              */}
      {/* ========================================================================= */}
      <DownloadAnimationModal
        isOpen={isDownloadModalOpen}
        title="Mengunduh Hasil Jawaban (.cbt)"
        subtitle="Memproses stempel digital & enkripsi hasil ujian..."
        fileName={resultFileName}
        fileType="cbt"
        onComplete={() => {
          onDownloadEncryptedResult();
          handleDownloadCompleted();
        }}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
};
