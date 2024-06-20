export class SpeechApi {

    isRecording = false;
    recorder;
    callBack;
    
    constructor() {

        let api;
        try {
            api = window.SpeechRecognition || webkitSpeechRecognition;
        } catch { }
        if (api) {
            console.log("SpeechRecognition is available :)");
            const recorder = new api();
            recorder.continuous = true;
            recorder.interimResults = true;
            recorder.maxAlternatives = 1;
            recorder.onend = this.reset();            
            recorder.lang = "nb-NO";
            recorder.addEventListener("result", (event) => this.onResult(event));
            this.recorder = recorder;
            this.reset();        
        } else {
            console.log("Could not create the SpeechRecognition instance");
        }
    }

    onResult(event) {
        console.log('speech-result received', event);
        try {
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    const content = event.results[i][0].transcript;
                    if (this.callBack) {
                        this.callBack(content);
                    } else {
                        console.log(content);
                    }
                }
            }
        } catch (err) {
            alert("error in result:" + err);
        }
    }

    reset() {
        console.log("reset");
        this.isRecording = false;
    }    

   async startRecording(callBack) {
        if (this.isRecording) {
            return this.stopRecording();
        }
        console.log("Speech-start");
        this.callBack = callBack;
        this.recorder?.start();
        this.isRecording = true;
   }

   async stopRecording() {
        console.log("Speech-stop");
        this.recorder?.stop();
        this.isRecording = false;
   }

}

const speech = new SpeechApi();
export default speech;