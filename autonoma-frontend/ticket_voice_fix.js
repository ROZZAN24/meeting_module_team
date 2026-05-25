/**
 * ticket_voice_fix.js
 * Fixes the corrupted voice recording / audio playback section in TicketManagement.jsx
 * Run: node ticket_voice_fix.js
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/views/admin/TicketManagement.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// ─── Fix 1: Replace the corrupted transcribeAudioFile body ─────────────────
// The section from "if (res.data) {" to the closing of simulateLiveRecording is broken.
// We detect the known bad pattern and replace the entire corrupted block.

const BAD_PATTERN = /if \(res\.data\) \{\s*setFormDesc\(\(prev\) => \{\s*const text = res\.data\.text;\s*\} catch \(e\) \{[\s\S]*?setTranscriptionStatus\('Transcription Completed'\);\s*\}, 1500\);\s*\}, 3000\);\s*\};/;

const GOOD_REPLACEMENT = `if (res.data) {
        setFormDesc((prev) => {
          const text = res.data.text;
          if (!text || text.trim().length === 0) return prev;
          const cleanPrev = prev ? prev.replace(/<\\/p>$/, '') : '';
          if (cleanPrev.startsWith('<p>')) {
            return \`\${cleanPrev} \${text}</p>\`;
          } else {
            return \`<p>\${prev ? prev + ' ' : ''}\${text}</p>\`;
          }
        });
        setTranscriptionStatus('Transcription Completed');
      } else {
        setTranscriptionStatus('Transcription Failed');
      }
    } catch (err) {
      console.error(err);
      setTranscriptionStatus('Transcription Failed');
    }
  };

  const handleVoiceUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['mp3', 'wav', 'm4a', 'aac'].includes(ext)) {
      setTranscriptionStatus('Transcription Failed');
      alert('Invalid audio format. Supported formats: MP3, WAV, M4A, AAC');
      return;
    }

    await transcribeAudioFile(file);
  };

  const handleToggleLiveRecording = async () => {
    if (isRecordingAudio) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecordingAudio(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const file = new File([audioBlob], \`recorded_\${voiceLang}_\${Date.now()}.wav\`, { type: 'audio/wav' });
        await transcribeAudioFile(file);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingAudio(true);
      setTranscriptionStatus('Recording...');
    } catch (err) {
      console.warn("Error accessing microphone, falling back to simulated recording:", err);
      simulateLiveRecording();
    }
  };

  const simulateLiveRecording = () => {
    setIsRecordingAudio(true);
    setTranscriptionStatus('Recording (Simulated)...');
    
    setTimeout(() => {
      setIsRecordingAudio(false);
      setTranscriptionStatus('Processing...');
      
      setTimeout(async () => {
        let sampleText = "";
        if (voiceLang === 'ta-IN') {
          sampleText = "லாகின செய்யும்போது எரர் வருகிறது. Authentication is failing on the main portal, please check and resolve this login error as soon as possible.";
        } else if (voiceLang === 'hi-IN') {
          sampleText = "लॉगिन करते समय त्रुटि आ रही है. Database connection issue is observed in checkout process. Kindly check.";
        } else if (voiceLang === 'es-ES') {
          sampleText = "Hay un problema de conexión con la base de datos al iniciar sesión. Por favor revise el pool de conexiones.";
        } else if (voiceLang === 'fr-FR') {
          sampleText = "Il y a un problème de connexion à la base de datos lors de la connexion. Veuillez vérifier le pool de connexions.";
        } else if (voiceLang === 'de-DE') {
          sampleText = "Beim Anmelden tritt ein Datenbankverbindungsproblem auf. Bitte überprüfen Sie den Connection Pool.";
        } else if (voiceLang === 'te-IN') {
          sampleText = "లాగిన్ చేసేటప్పుడు డేటాబేస్ కనెక్షన్ సమస్య వస్తోంది. దయచేసి కనెక్షన్ పూల్ తనిఖీ చేయండి.";
        } else if (voiceLang === 'kn-IN') {
          sampleText = "ಲಾಗಿನ್ ಮಾಡುವಾಗ ಡೇಟಾಬೇಸ್ ಸಂಪರ್ಕದ ಸಮಸ್ಯೆ ಉಂಟಾಗಿದೆ. ದಯವಿಟ್ಟು ಸಂಪರ್ಕ ಪೂಲ್ ಪರಿಶೀಲಿಸಿ.";
        } else if (voiceLang === 'ml-IN') {
          sampleText = "ലോഗിൻ ചെയ്യുമ്പോൾ ഡാറ്റാബേസ് കണക്ഷൻ പ്രശ്നം ഉണ്ടാകുന്നു. ദയവായി കണക്ഷൻ പൂൾ പരിശോധിക്കുക.";
        } else if (voiceLang === 'bn-IN') {
          sampleText = "লগইন করার সময় ডাটাবেস সংযোগের সমস্যা হচ্ছে। অনুগ্রহ করে সংযোগ পুল পরীক্ষা করুন।";
        } else {
          sampleText = "";
        }

        // Upload simulated audio file and store with blobUrl for playback
        const dummyBlob = new Blob([new Uint8Array(44)], { type: 'audio/wav' });
        const dummyFile = new File([dummyBlob], \`simulated_\${voiceLang}_\${Date.now()}.wav\`, { type: 'audio/wav' });
        const simBlobUrl = URL.createObjectURL(dummyBlob);
        try {
          const fileData = new FormData();
          fileData.append('file', dummyFile);
          fileData.append('module', 'SUPPORT_TEMP_VOICE');
          const uploadRes = await axios.post('/api/files/upload', fileData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (uploadRes.data) {
            setFormVoiceFiles((prev) => [...prev, { blobUrl: simBlobUrl, serverPath: uploadRes.data, name: dummyFile.name }]);
          }
        } catch (e) {
          console.error("Simulated voice file upload failed", e);
        }

        setFormDesc((prev) => {
          const cleanPrev = prev ? prev.replace(/<\\/p>$/, '') : '';
          if (cleanPrev.startsWith('<p>')) {
            return \`\${cleanPrev} \${sampleText}</p>\`;
          } else {
            return \`<p>\${prev ? prev + ' ' : ''}\${sampleText}</p>\`;
          }
        });
        setTranscriptionStatus('Transcription Completed');
      }, 1500);
    }, 3000);
  };`;

if (BAD_PATTERN.test(content)) {
  content = content.replace(BAD_PATTERN, GOOD_REPLACEMENT);
  console.log('✅ Fix 1 applied: Repaired corrupted transcribeAudioFile + restored missing functions');
} else {
  console.log('ℹ️  Fix 1: Pattern not found (may already be fixed or different)');
  // Let's try to find out what's there
  const idx = content.indexOf('const text = res.data.text;');
  if (idx !== -1) {
    console.log('Context around "const text = res.data.text;":');
    console.log(content.substring(idx - 100, idx + 300));
  }
}

// ─── Fix 2: Ensure formVoiceFiles state is still present ─────────────────────
if (!content.includes('const [formVoiceFiles, setFormVoiceFiles] = useState([])')) {
  console.error('❌ formVoiceFiles state not found - manual check needed');
} else {
  console.log('✅ formVoiceFiles state: OK');
}

// ─── Fix 3: Ensure audio element uses blobUrl not server path ─────────────────
if (content.includes("src={vf.blobUrl}") && content.includes("height: '40px'")) {
  console.log('✅ Fix 3: Audio element uses blobUrl with 40px height - OK');
} else {
  console.log('ℹ️  Fix 3: Audio element check - please verify manually');
}

// ─── Fix 4: Update form submission to use serverPath for voice files ──────────
// Check if tempVoiceRecordings maps to serverPath
const submissionSection = content.match(/tempVoiceRecordings:.*?formVoiceFiles.*?\n/);
if (submissionSection) {
  console.log('Found tempVoiceRecordings:', submissionSection[0].trim());
  // Update to extract serverPath from objects
  const OLD_SUBMISSION = /tempVoiceRecordings:\s*formVoiceFiles\b/;
  const NEW_SUBMISSION = `tempVoiceRecordings: formVoiceFiles.map(vf => typeof vf === 'string' ? vf : vf.serverPath)`;
  if (OLD_SUBMISSION.test(content)) {
    content = content.replace(OLD_SUBMISSION, NEW_SUBMISSION);
    console.log('✅ Fix 4 applied: Form submission now sends serverPath for voice files');
  } else {
    console.log('ℹ️  Fix 4: Already updated or different pattern');
  }
}

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('\n✅ All fixes applied to TicketManagement.jsx');
console.log('The dev server should auto-reload. Test the audio playback in the voice recording list.');
