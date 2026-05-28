import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axiosServices from 'utils/axios';

export const useWebRTC = (currentUserId, onIncomingCall, onCallEnded) => {
  const [stompClient, setStompClient] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const peerConnection = useRef(null);
  const [activeCallId, setActiveCallId] = useState(null);
  const [remoteUserId, setRemoteUserId] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  // Initialize WebSocket connection
  useEffect(() => {
    const token = sessionStorage.getItem('serviceToken');
    if (!token) {
      console.error('No serviceToken found in sessionStorage');
      return;
    }

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
    const client = new Client({
      webSocketFactory: () => new SockJS(`${baseUrl}/ws/signaling`),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: function (str) {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('Connected to Signaling Server');
      // Subscribe to user-specific queue via topic
      client.subscribe(`/topic/signaling.${currentUserId}`, (message) => {
        const data = JSON.parse(message.body);
        handleSignalingMessage(data);
      });
    };

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
    };
  }, []);

  const initPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && remoteUserId && stompClient) {
        stompClient.publish({
          destination: '/app/signaling',
          body: JSON.stringify({
            type: 'ICE_CANDIDATE',
            targetUser: remoteUserId,
            candidate: event.candidate
          })
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    peerConnection.current = pc;
    return pc;
  };

  const startLocalMedia = async (video = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video, audio: true });
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('Error accessing media devices.', err);
      return null;
    }
  };

  const makeCall = async (targetUserId, video = true) => {
    setRemoteUserId(targetUserId);
    const stream = await startLocalMedia(video);
    if (!stream) return;

    const pc = initPeerConnection();
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    if (!stompClient) {
      console.error("WebSocket is not connected!");
      return;
    }

    stompClient.publish({
      destination: '/app/signaling',
      body: JSON.stringify({
        type: 'CALL_OFFER',
        targetUser: targetUserId,
        offer: offer,
        video: video
      })
    });
  };

  const handleSignalingMessage = async (data) => {
    const { type, sender, offer, answer, candidate, video } = data;

    switch (type) {
      case 'CALL_OFFER':
        setRemoteUserId(sender);
        if (onIncomingCall) onIncomingCall(sender, video, offer);
        break;

      case 'CALL_ANSWER':
        if (peerConnection.current) {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        }
        break;

      case 'ICE_CANDIDATE':
        if (peerConnection.current) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
        break;

      case 'CALL_REJECT':
      case 'CALL_END':
        cleanupCall();
        if (onCallEnded) onCallEnded();
        break;

      default:
        break;
    }
  };

  const acceptCall = async (callerId, offer, video = true) => {
    setRemoteUserId(callerId);
    const stream = await startLocalMedia(video);
    if (!stream) return;

    const pc = initPeerConnection();
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    stompClient.publish({
      destination: '/app/signaling',
      body: JSON.stringify({
        type: 'CALL_ANSWER',
        targetUser: callerId,
        answer: answer
      })
    });
  };

  const rejectCall = (callerId) => {
    if (stompClient && callerId) {
      stompClient.publish({
        destination: '/app/signaling',
        body: JSON.stringify({
          type: 'CALL_REJECT',
          targetUser: callerId
        })
      });
    }
    cleanupCall();
  };

  const endCall = () => {
    if (stompClient && remoteUserId) {
      stompClient.publish({
        destination: '/app/signaling',
        body: JSON.stringify({
          type: 'CALL_END',
          targetUser: remoteUserId
        })
      });
    }
    cleanupCall();
  };

  const cleanupCall = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    setLocalStream(prevStream => {
      if (prevStream) {
        prevStream.getTracks().forEach(track => track.stop());
      }
      return null;
    });
    setRemoteStream(null);
    setRemoteUserId(null);
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  return {
    localStream,
    remoteStream,
    makeCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
    isAudioEnabled,
    isVideoEnabled
  };
};
