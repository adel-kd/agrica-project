const axios = require('axios');

async function simulateCall() {
    try {
        console.log('--- Simulating IVR Interaction (Localhost) ---');

        // 1. Check if backend is reachable
        const healthCheck = await axios.get('http://localhost:5000/').catch(() => null);
        if (!healthCheck) {
            console.error('❌ Error: Backend is not running on http://localhost:5000');
            console.log('👉 Please run "npm run dev" in the backend folder first.');
            return;
        }
        console.log('✅ Backend is running.');

        // 2. Define the webhook payload (Mimicking Infobip)
        // We point recordedUrl to a file served by our own backend for testing purposes.
        // Ensure "uploads/input.wav" exists in backend/uploads/ or use another file.
        const inputWavUrl = "http://localhost:5000/uploads/input.wav";

        // Check if the input file is actually being served (optional verify)
        const fileCheck = await axios.head(inputWavUrl).catch(() => null);
        if (!fileCheck) {
            console.warn("⚠️ Warning: 'uploads/input.wav' may not be accessible at http://localhost:5000/uploads/input.wav");
            console.warn("   Make sure 'input.wav' exists in backend/uploads/ and server is running.");
        }

        const payload = {
            results: [
                {
                    recordedUrl: inputWavUrl,
                    dtmf: ""
                }
            ]
        };

        console.log('Sending webhook payload:', JSON.stringify(payload, null, 2));

        // 3. Send POST request
        const response = await axios.post('http://localhost:5000/api/ivr/webhook', payload);

        // 4. Log the result
        console.log('\n--- AI Response ---');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));

        if (response.data.commands && response.data.commands[0].play) {
            console.log('\n✅ Success! The system processed the audio and returned a play command.');
            console.log('Audio URL to play:', response.data.commands[0].play.url);
        } else {
            console.log('\n⚠️ Warning: unexpected response format.');
        }

    } catch (error) {
        console.error('❌ Simulation failed:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    }
}

simulateCall();
