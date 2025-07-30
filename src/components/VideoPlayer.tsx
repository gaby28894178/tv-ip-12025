import React, { useRef, useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  channel: {
    id: number;
    nombre: string;
    url: string;
    logo: string;
  };
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ channel, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);

  const loadStream = useCallback(async () => {
    if (!videoRef.current) return;

    console.log('Loading stream for:', channel.nombre);
    setIsLoading(true);
    setError(null);

    try {
      const video = videoRef.current;
      
      // Limpiar HLS anterior si existe
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // Configurar volumen
      video.volume = volume / 100;
      video.muted = isMuted;
      video.playsInline = true;
      video.crossOrigin = 'anonymous';

      // Verificar si es un stream HLS
      if (channel.url.includes('.m3u8')) {
        console.log('🎬 Detected HLS stream:', channel.url);
        
        if (Hls.isSupported()) {
          console.log('✅ HLS.js is supported');
          
          // Usar HLS.js con configuración optimizada para buffer
          const hls = new Hls({
            debug: false,
            enableWorker: true,
            lowLatencyMode: false,
            
            // Configuración de buffer optimizada
            backBufferLength: 120, // Aumentado para mejor buffer
            maxBufferLength: 60,   // Buffer máximo más grande
            maxBufferSize: 120 * 1000 * 1000, // 120MB de buffer
            maxBufferHole: 0.3,    // Tolerancia a huecos en buffer
            
            // Configuración de fragmentos
            maxFragLookUpTolerance: 0.25,
            liveSyncDurationCount: 2,  // Reducido para menos latencia
            liveMaxLatencyDurationCount: 8, // Reducido
            
            // Configuración de carga
            maxLoadingDelay: 2,    // Reducido para carga más rápida
            maxStarvationDelay: 2, // Reducido
            startLevel: -1,        // Auto-selección de calidad
            
            // Optimizaciones adicionales
            capLevelToPlayerSize: true,  // Ajustar calidad al tamaño del player
            testBandwidth: true,         // Probar ancho de banda
            progressive: false,
            optimizeBufferSize: true,    // Optimizar tamaño de buffer
            
            // Configuración de red
            manifestLoadingTimeOut: 10000,     // 10s timeout para manifest
            manifestLoadingMaxRetry: 3,        // 3 reintentos
            manifestLoadingRetryDelay: 500,    // 500ms entre reintentos
            levelLoadingTimeOut: 10000,        // 10s timeout para levels
            levelLoadingMaxRetry: 3,           // 3 reintentos
            levelLoadingRetryDelay: 500,       // 500ms entre reintentos
            fragLoadingTimeOut: 20000,         // 20s timeout para fragmentos
            fragLoadingMaxRetry: 6,            // 6 reintentos para fragmentos
            fragLoadingRetryDelay: 1000,       // 1s entre reintentos
            
            // Configuración de streaming adaptativo
            abrEwmaFastLive: 3.0,     // Respuesta rápida a cambios de ancho de banda
            abrEwmaSlowLive: 9.0,     // Respuesta lenta para estabilidad
            abrMaxWithRealBitrate: false,
            
            // Configuración de audio/video
            enableSoftwareAES: true,   // Habilitar AES por software si es necesario
            enableCEA708Captions: false, // Deshabilitar subtítulos para mejor rendimiento
            stretchShortVideoTrack: false,
            maxAudioFramesDrift: 1,
            forceKeyFrameOnDiscontinuity: true,
            
            // Configuración de worker
            workerPath: undefined // Usar worker por defecto
          });

          hlsRef.current = hls;

          hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            console.log('✅ HLS media attached to video element');
          });

          hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            console.log('✅ HLS manifest parsed successfully', data);
            setIsLoading(false);
            
            // Intentar reproducir automáticamente
            video.play().then(() => {
              console.log('✅ Video started playing automatically');
              setIsPlaying(true);
              setNeedsUserInteraction(false);
            }).catch((err) => {
              console.log('⚠️ Auto-play prevented, user interaction required:', err.message);
              setIsLoading(false);
              setNeedsUserInteraction(true);
              // No mostrar error por autoplay bloqueado
            });
          });

          hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
            console.log('📺 HLS level loaded:', data.level);
          });

          hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
            console.log('🧩 HLS fragment loaded:', data.frag.url);
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('❌ HLS error occurred:', {
              type: data.type,
              details: data.details,
              fatal: data.fatal,
              url: data.url,
              response: data.response
            });
            
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error('🌐 Network error details:', data);
                  if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
                    setError('No se puede acceder al canal. URL no disponible.');
                  } else if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT) {
                    setError('Tiempo de espera agotado. Verifique su conexión.');
                  } else {
                    setError('Error de conexión. Verifique su internet.');
                  }
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error('🎵 Media error details:', data);
                  setError('Error de reproducción. El formato no es compatible.');
                  break;
                case Hls.ErrorTypes.MUX_ERROR:
                  console.error('🔧 Mux error details:', data);
                  setError('Error en el formato del stream.');
                  break;
                default:
                  console.error('❓ Unknown error details:', data);
                  setError('Error desconocido al cargar el canal.');
                  break;
              }
              setIsLoading(false);
            } else {
              // Error no fatal, intentar recuperar
              console.log('⚠️ Non-fatal error, attempting recovery:', data.details);
            }
          });

          console.log('🔗 Attaching media and loading source...');
          hls.attachMedia(video);
          hls.loadSource(channel.url);

        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          console.log('🍎 Using Safari native HLS support');
          // Safari nativo
          video.src = channel.url;
          video.load();
          
          video.play().then(() => {
            console.log('✅ Video started playing (Safari native)');
            setIsLoading(false);
            setIsPlaying(true);
            setNeedsUserInteraction(false);
          }).catch((err) => {
            console.log('⚠️ Safari auto-play prevented:', err);
            setIsLoading(false);
            setNeedsUserInteraction(true);
          });
        } else {
          console.error('❌ HLS not supported in this browser');
          setError('Su navegador no soporta streaming HLS. Use Chrome, Firefox o Safari.');
          setIsLoading(false);
        }
      } else {
        console.log('📹 Direct stream detected:', channel.url);
        // Stream directo (no HLS)
        video.src = channel.url;
        video.load();
        
        video.play().then(() => {
          console.log('✅ Direct video started playing');
          setIsLoading(false);
          setIsPlaying(true);
          setNeedsUserInteraction(false);
        }).catch((err) => {
          console.log('⚠️ Direct stream auto-play prevented:', err);
          setIsLoading(false);
          setNeedsUserInteraction(true);
        });
      }

    } catch (err) {
      console.error('❌ Load error:', err);
      setError('Error al cargar el canal. Intente nuevamente.');
      setIsLoading(false);
    }
  }, [channel.url, channel.nombre, volume, isMuted]);

  useEffect(() => {
    loadStream();
    
    // Cleanup al desmontar
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel.id, loadStream]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => {
      console.log('Load start');
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      console.log('Can play');
      setIsLoading(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };
    
    const handlePause = () => setIsPlaying(false);
    
    const handlePlaying = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };
    
    const handleVolumeChange = () => {
      setVolume(Math.round(video.volume * 100));
      setIsMuted(video.muted);
    };

    const handleError = (e: Event) => {
      console.error('Video error:', e);
      setError('Error al reproducir el canal. Verifique la conexión.');
      setIsLoading(false);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('error', handleError);
    video.addEventListener('waiting', handleWaiting);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('error', handleError);
      video.removeEventListener('waiting', handleWaiting);
    };
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustVolume(10);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustVolume(-10);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const resetTimeout = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    const handleMouseMove = () => resetTimeout();
    
    document.addEventListener('mousemove', handleMouseMove);
    resetTimeout();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (needsUserInteraction) {
      // Primera interacción del usuario después de autoplay bloqueado
      videoRef.current.play().then(() => {
        console.log('✅ Video started playing after user interaction');
        setIsPlaying(true);
        setNeedsUserInteraction(false);
        setIsLoading(false);
      }).catch((err) => {
        console.error('❌ Play failed even with user interaction:', err);
        if (err.name === 'NotAllowedError') {
          setError('Reproducción bloqueada por el navegador.');
        } else {
          setError('Error al reproducir el canal.');
        }
        setIsLoading(false);
      });
    } else if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((err) => {
        console.error('Play failed:', err);
        if (err.name === 'NotAllowedError') {
          setError('Reproducción bloqueada. Haga clic en el botón de reproducir.');
        }
      });
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
  };

  const adjustVolume = (delta: number) => {
    if (!videoRef.current) return;
    const newVolume = Math.max(0, Math.min(100, volume + delta));
    videoRef.current.volume = newVolume / 100;
    setVolume(newVolume);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newVolume = parseInt(e.target.value);
    videoRef.current.volume = newVolume / 100;
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      videoRef.current.muted = false;
    }
  };

  const handleClose = useCallback(() => {
    console.log('🔴 Closing video player');
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }
    
    // Limpiar HLS
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    
    onClose();
  }, [onClose]);

  const handleRetry = () => {
    setError(null);
    loadStream();
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="relative w-full h-full bg-black overflow-hidden">
        {/* Header */}
        <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={channel.logo} 
                alt={channel.nombre}
                className="w-8 h-8 rounded object-contain bg-white/10"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/logos/default.svg';
                }}
              />
              <h2 className="text-white text-lg font-semibold">{channel.nombre}</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-red-400 transition-colors p-2"
              title="Cerrar (Esc)"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Video */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          controls={false}
          autoPlay
          playsInline
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-white text-lg">Cargando {channel.nombre}...</p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-white text-xl font-semibold mb-4">Error de Reproducción</h3>
              <p className="text-gray-300 mb-6">{error}</p>
              <div className="space-x-4">
                <button
                  onClick={handleRetry}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Reintentar
                </button>
                <button
                  onClick={handleClose}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Interaction Needed Overlay */}
        {needsUserInteraction && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="text-blue-500 text-6xl mb-4">▶️</div>
              <h3 className="text-white text-xl font-semibold mb-4">Listo para Reproducir</h3>
              <p className="text-gray-300 mb-6">
                Haga clic en el botón de reproducir para iniciar el stream de {channel.nombre}
              </p>
              <button
                onClick={togglePlayPause}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg transition-colors text-lg font-semibold"
              >
                ▶️ Reproducir Canal
              </button>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play/Pause */}
              <button
                onClick={togglePlayPause}
                className="text-white hover:text-red-400 transition-colors p-2"
                title="Reproducir/Pausar (Espacio)"
              >
                {isPlaying ? (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>

              {/* Volume */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-red-400 transition-colors"
                  title="Silenciar (M)"
                >
                  {isMuted || volume === 0 ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  title={`Volumen: ${volume}%`}
                />
                <span className="text-white text-sm w-8">{volume}%</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-white text-sm">
                {isPlaying ? '🔴 EN VIVO' : '⏸️ PAUSADO'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;