// Network Synchronization using WebRTC
// Allows two browsers on the same network to sync scores in real-time

class NetworkSync {
    constructor(onScoresUpdate, onTeamsUpdate, onConnectionChange) {
        this.onScoresUpdate = onScoresUpdate;
        this.onTeamsUpdate = onTeamsUpdate;
        this.onConnectionChange = onConnectionChange;

        this.peerConnection = null;
        this.dataChannel = null;
        this.mode = null; // 'display' or 'entry'
        this.isConnected = false;

        // STUN servers for NAT traversal (Google's public STUN servers)
        this.configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' }
            ],
            iceCandidatePoolSize: 10
        };
    }

    // Initialize as display station (receives scores)
    async initializeAsDisplay() {
        this.mode = 'display';
        this.peerConnection = new RTCPeerConnection(this.configuration);

        // Monitor connection state
        this.peerConnection.onconnectionstatechange = () => {
            console.log('Display connection state:', this.peerConnection.connectionState);
            if (this.peerConnection.connectionState === 'connected') {
                console.log('WebRTC connection established!');
            } else if (this.peerConnection.connectionState === 'failed') {
                console.error('WebRTC connection failed');
                this.onConnectionChange(false);
            }
        };

        // IMPORTANT: Create data channel on the offerer (display side)
        this.dataChannel = this.peerConnection.createDataChannel('scores');
        this.setupDataChannel();

        // Create offer
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        console.log('Initial ICE gathering state:', this.peerConnection.iceGatheringState);
        console.log('ICE connection state:', this.peerConnection.iceConnectionState);

        // Wait for ICE gathering to complete by waiting for null candidate
        let candidateCount = 0;
        await new Promise((resolve) => {
            // Check if already complete
            if (this.peerConnection.iceGatheringState === 'complete') {
                console.log('ICE gathering already complete');
                resolve();
                return;
            }

            // Wait for the null candidate which signals completion
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    candidateCount++;
                    console.log(`ICE candidate ${candidateCount}:`, event.candidate.type, event.candidate.candidate.substring(0, 50));
                } else {
                    console.log('ICE candidate gathering finished (null candidate received)');
                    console.log(`Total ICE candidates gathered: ${candidateCount}`);
                    resolve();
                }
            };
        });

        // Return the offer WITH ICE candidates as a connection code
        const finalOffer = this.peerConnection.localDescription;
        console.log('Display mode offer created:', finalOffer.type);
        console.log('SDP includes ICE candidates:', finalOffer.sdp.includes('candidate'));
        return this.encodeConnectionData({
            type: 'offer',
            sdp: finalOffer.sdp
        });
    }

    // Initialize as entry station (sends scores)
    async initializeAsEntry(offerCode) {
        this.mode = 'entry';
        this.peerConnection = new RTCPeerConnection(this.configuration);

        // Monitor connection state
        this.peerConnection.onconnectionstatechange = () => {
            console.log('Entry connection state:', this.peerConnection.connectionState);
            if (this.peerConnection.connectionState === 'connected') {
                console.log('WebRTC connection established!');
            } else if (this.peerConnection.connectionState === 'failed') {
                console.error('WebRTC connection failed');
                this.onConnectionChange(false);
            }
        };

        // Listen for data channel from offerer
        this.peerConnection.ondatachannel = (event) => {
            this.dataChannel = event.channel;
            this.setupDataChannel();
            console.log('Entry mode: received data channel from display');
        };

        // Decode and set remote offer
        const offerData = this.decodeConnectionData(offerCode);
        console.log('Entry mode: setting remote offer');
        await this.peerConnection.setRemoteDescription({
            type: 'offer',
            sdp: offerData.sdp
        });

        // Create answer
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        console.log('Initial ICE gathering state:', this.peerConnection.iceGatheringState);

        // Wait for ICE gathering to complete by waiting for null candidate
        let candidateCount = 0;
        await new Promise((resolve) => {
            // Check if already complete
            if (this.peerConnection.iceGatheringState === 'complete') {
                console.log('ICE gathering already complete');
                resolve();
                return;
            }

            // Wait for the null candidate which signals completion
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    candidateCount++;
                    console.log(`ICE candidate ${candidateCount}:`, event.candidate.type, event.candidate.candidate.substring(0, 50));
                } else {
                    console.log('ICE candidate gathering finished (null candidate received)');
                    console.log(`Total ICE candidates gathered: ${candidateCount}`);
                    resolve();
                }
            };
        });

        // Return answer WITH ICE candidates as connection code
        const finalAnswer = this.peerConnection.localDescription;
        console.log('Entry mode answer created:', finalAnswer.type);
        console.log('SDP includes ICE candidates:', finalAnswer.sdp.includes('candidate'));
        return this.encodeConnectionData({
            type: 'answer',
            sdp: finalAnswer.sdp
        });
    }

    // Complete connection on display station with answer from entry station
    async completeConnection(answerCode) {
        const answerData = this.decodeConnectionData(answerCode);
        await this.peerConnection.setRemoteDescription({
            type: 'answer',
            sdp: answerData.sdp
        });
    }

    // Set up data channel event handlers
    setupDataChannel() {
        this.dataChannel.onopen = () => {
            this.isConnected = true;
            console.log('Data channel opened');
            this.onConnectionChange(true);
        };

        this.dataChannel.onclose = () => {
            this.isConnected = false;
            console.log('Data channel closed');
            this.onConnectionChange(false);
        };

        this.dataChannel.onerror = (error) => {
            console.error('Data channel error:', error);
        };

        this.dataChannel.onmessage = (event) => {
            this.handleMessage(event.data);
        };
    }

    // Handle incoming messages
    handleMessage(data) {
        try {
            const message = JSON.parse(data);

            switch (message.type) {
                case 'scores_update':
                    this.onScoresUpdate(message.scores);
                    break;
                case 'teams_update':
                    this.onTeamsUpdate(message.teams);
                    break;
                case 'full_sync':
                    this.onScoresUpdate(message.scores);
                    this.onTeamsUpdate(message.teams);
                    break;
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }

    // Send scores update
    sendScoresUpdate(scores) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify({
                type: 'scores_update',
                scores: scores
            }));
        }
    }

    // Send teams update
    sendTeamsUpdate(teams) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify({
                type: 'teams_update',
                teams: teams
            }));
        }
    }

    // Send full sync (teams + scores)
    sendFullSync(teams, scores) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify({
                type: 'full_sync',
                teams: teams,
                scores: scores
            }));
        }
    }

    // Encode connection data to a shareable string
    encodeConnectionData(data) {
        return btoa(JSON.stringify(data));
    }

    // Decode connection data from string
    decodeConnectionData(code) {
        return JSON.parse(atob(code));
    }

    // Disconnect
    disconnect() {
        if (this.dataChannel) {
            this.dataChannel.close();
        }
        if (this.peerConnection) {
            this.peerConnection.close();
        }
        this.isConnected = false;
        this.onConnectionChange(false);
    }
}
