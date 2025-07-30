import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import ChannelCard from './ChannelCard';
import VideoPlayer from './VideoPlayer';

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

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadChannels = async () => {
      try {
        const response = await fetch('/canales.json');
        const data = await response.json();
        setChannels(data.canales);
        setFilteredChannels(data.canales);
        setLoading(false);
      } catch (error) {
        console.error('Error loading channels:', error);
        setLoading(false);
      }
    };

    loadChannels();
  }, []);

  useEffect(() => {
    let filtered = channels;
    
    // Filtrar por término de búsqueda
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(channel =>
        channel.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        channel.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        channel.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredChannels(filtered);
  }, [searchTerm, channels]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleChannelClick = (channel: Channel) => {
    setSelectedChannel(channel);
  };

  const handleClosePlayer = () => {
    setSelectedChannel(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen argentina-gradient flex items-center justify-center">
        <div className="argentina-content text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-xl">Cargando canales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen argentina-gradient">
      <div className="argentina-content">
        <Navbar onSearchChange={handleSearchChange} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        {/* Channels Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            {searchTerm 
              ? `Resultados para "${searchTerm}"` 
              : 'Todos los Canales'
            }
            <span className="text-gray-400 text-lg ml-2">
              ({filteredChannels.length} canales)
            </span>
          </h2>
          
          {filteredChannels.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📺</div>
              <h3 className="text-xl text-white mb-2">
                {searchTerm ? 'No se encontraron canales' : 'No hay canales disponibles'}
              </h3>
              <p className="text-gray-400">
                {searchTerm 
                  ? `No se encontraron canales que coincidan con "${searchTerm}"`
                  : 'No hay canales disponibles en este momento'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  onClick={handleChannelClick}
                />
              ))}
            </div>
          )}
        </div>

        {/* Channel Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="card-gradient-border">
            <div className="card-gradient-content rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">{channels.length}</div>
              <div className="text-gray-300">Canales Disponibles</div>
            </div>
          </div>
          <div className="card-gradient-border">
            <div className="card-gradient-content rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">24/7</div>
              <div className="text-gray-300">Transmisión en Vivo</div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Video Player Modal */}
      {selectedChannel && (
        <VideoPlayer
          channel={selectedChannel}
          onClose={handleClosePlayer}
        />
      )}
    </div>
  );
};

export default Dashboard;