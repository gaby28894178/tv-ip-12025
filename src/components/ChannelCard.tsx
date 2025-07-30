import React from 'react';

interface Channel {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  url: string;
  idioma: string;
  pais: string;
  logo: string;
}

interface ChannelCardProps {
  channel: Channel;
  onClick: (channel: Channel) => void;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ channel, onClick }) => {
  // Función para obtener las iniciales del canal
  const getInitials = (name: string) => {
    const words = name.split(' ').filter(word => word.length > 0);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return words[0] ? words[0].substring(0, 2).toUpperCase() : 'TV';
  };

  // Función para generar color basado en el nombre
  const getBackgroundColor = (name: string) => {
    const colors = [
      'from-red-500 to-red-700',
      'from-blue-500 to-blue-700',
      'from-green-500 to-green-700',
      'from-purple-500 to-purple-700',
      'from-orange-500 to-orange-700',
      'from-pink-500 to-pink-700',
      'from-indigo-500 to-indigo-700',
      'from-teal-500 to-teal-700'
    ];
    const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div
      onClick={() => onClick(channel)}
      className="card-gradient-border group relative cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-10 shadow-lg hover:shadow-2xl"
    >
      <div className="card-gradient-content rounded-xl overflow-hidden">
        {/* Channel Logo/Background */}
        <div className="aspect-video relative">
          {/* Imagen de fondo que cubre toda la tarjeta */}
          {channel.logo && channel.logo.trim() !== '' ? (
            <img
              src={channel.logo}
              alt={channel.nombre}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              onLoad={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.opacity = '1';
                const fallback = target.parentElement?.querySelector('.fallback-initials') as HTMLElement;
                if (fallback) fallback.style.display = 'none';
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.opacity = '0';
                const fallback = target.parentElement?.querySelector('.fallback-initials') as HTMLElement;
                if (fallback) {
                  fallback.style.display = 'flex';
                }
              }}
              style={{ opacity: '0' }}
            />
          ) : null}
          
          {/* Fallback con iniciales */}
          <div className={`fallback-initials flex items-center justify-center absolute inset-0 bg-gradient-to-br ${getBackgroundColor(channel.nombre)} ${!channel.logo || channel.logo.trim() === '' ? '' : 'hidden'}`}>
            <span className="text-white text-5xl font-bold drop-shadow-lg">
              {getInitials(channel.nombre)}
            </span>
          </div>
          
          {/* Overlay oscuro para mejorar legibilidad */}
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        </div>

      {/* Overlay with channel info */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-85 transition-all duration-300 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100">
        <div className="text-white">
          <h3 className="font-bold text-lg mb-2 truncate">{channel.nombre}</h3>
          <p className="text-sm text-gray-300 mb-3 line-clamp-3 leading-relaxed">{channel.descripcion}</p>
          <div className="flex items-center justify-between">
            <span className="bg-red-600 text-sm px-3 py-1 rounded-full truncate max-w-32">
              {channel.categoria}
            </span>
            <span className="text-sm text-gray-400">{channel.idioma}</span>
          </div>
        </div>
      </div>

      {/* Play button */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
        <div className="bg-red-600 rounded-full p-4 shadow-2xl hover:bg-red-700 transition-colors">
          <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>

      {/* Channel name at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 group-hover:opacity-0 transition-opacity duration-300">
        <h3 className="text-white font-bold text-lg truncate">{channel.nombre}</h3>
        <p className="text-gray-300 text-sm truncate">{channel.categoria}</p>
      </div>
      </div>
    </div>
  );
};

export default ChannelCard;