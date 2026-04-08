import React, { useContext, useState, useEffect, useRef } from 'react';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../utils/api';
import toast from 'react-hot-toast';
import '../styles/ChatWindow.css';

const ChatWindow = () => {
  const { currentRoom, messages, setMessages, sendMessage, deleteMessage, editMessage } = useContext(ChatContext);
  const { user } = useContext(AuthContext);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeMessageMenu, setActiveMessageMenu] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (currentRoom) {
      setLoading(false);
    }
  }, [currentRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    try {
      const messageText = inputValue;
      setInputValue('');
      // Use Socket.io for real-time message sending
      sendMessage(messageText);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleDeleteMessage = (messageId, deleteForEveryone = true) => {
    if (deleteForEveryone) {
      // Delete for everyone
      deleteMessage(messageId);
      toast.success('Message deleted for everyone');
    } else {
      // Delete only for current user (local deletion)
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      toast.success('Message deleted');
    }
    setActiveMessageMenu(null);
  };

  const handleClearChat = () => {
    if (window.confirm('Clear all messages from this chat? This cannot be undone.')) {
      setMessages([]);
      toast.success('Chat cleared');
      setActiveMessageMenu(null);
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      console.log('No files selected');
      return;
    }

    setUploading(true);
    try {
      for (let file of files) {
        console.log('Starting upload for file:', file.name, file.type, file.size);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('roomId', currentRoom);
        
        const mediaType = file.type.startsWith('image/') ? 'image' : 'file';
        formData.append('type', mediaType);

        console.log('FormData prepared - roomId:', currentRoom, 'mediaType:', mediaType);
        
        try {
          const response = await apiClient.post('/chat/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          console.log('Upload response received:', response.data);
          
          // Don't add message here - it will come via Socket.io broadcast
          // This prevents duplicate messages
          
          toast.success(`${mediaType === 'image' ? 'Image' : 'File'} uploaded!`);
        } catch (uploadError) {
          console.error('Upload failed:', uploadError.response?.data || uploadError.message);
          throw uploadError;
        }
      }
      console.log('All files uploaded');
    } catch (error) {
      console.error('File upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading && currentRoom) {
    return <div className="chat-window loading">Loading messages...</div>;
  }

  return (
    <div className="chat-window">
      <div className="messages">
        {messages && messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`message ${msg.senderId === user?.id ? 'own' : 'other'}`}
              onMouseEnter={() => setActiveMessageMenu(msg._id)}
              onMouseLeave={() => setActiveMessageMenu(null)}
            >
              <div className="message-avatar" style={{ backgroundImage: `url(${msg.senderAvatar})` }} />
              <div className="message-content">
                <div className="message-header">
                  <p className="message-sender">{msg.senderUsername}</p>
                  <span className="message-time">
                    {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {msg.type === 'image' && msg.fileUrl ? (
                  <img 
                    src={`${process.env.REACT_APP_API_URL}${msg.fileUrl}`}
                    alt="shared" 
                    className="message-image"
                    onClick={() => {
                      console.log('Image clicked, fileUrl:', msg.fileUrl);
                      setSelectedImage(`${process.env.REACT_APP_API_URL}${msg.fileUrl}`);
                    }}
                    style={{ cursor: 'pointer' }}
                    title="Click to view full size"
                  />
                ) : msg.type === 'file' && msg.fileUrl ? (
                  <a 
                    href={`${process.env.REACT_APP_API_URL}${msg.fileUrl}`} 
                    download={msg.fileName} 
                    className="message-file"
                  >
                    📎 {msg.fileName}
                  </a>
                ) : (
                  <p className="message-text">{msg.content}</p>
                )}
                {msg.isEdited && <span className="message-edited">(edited)</span>}
                
                {/* Message action menu */}
                {activeMessageMenu === msg._id && (
                  <div className="message-actions">
                    {msg.senderId === user?.id && (
                      <>
                        <button
                          className="action-btn delete-for-me"
                          onClick={() => handleDeleteMessage(msg._id, false)}
                          title="Unsend for me only"
                        >
                          🗑️ Unsend for me
                        </button>
                        <button
                          className="action-btn delete-for-all"
                          onClick={() => handleDeleteMessage(msg._id, true)}
                          title="Unsend for everyone"
                        >
                          ✕ Unsend for all
                        </button>
                      </>
                    )}
                    {msg.senderId !== user?.id && (
                      <button
                        className="action-btn delete-for-me"
                        onClick={() => handleDeleteMessage(msg._id, false)}
                        title="Unsend for me only"
                      >
                        🗑️ Unsend for me
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-messages">No messages yet. Start the conversation!</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input-form">
        <div className="input-wrapper">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            className="file-input-hidden"
            disabled={uploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-attach"
            disabled={uploading}
            title="Attach media or files"
          >
            {uploading ? '⏳' : '📎'}
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="message-input"
            disabled={uploading}
          />
          <button type="submit" className="btn-send" disabled={uploading || !inputValue.trim()}>
            {uploading ? 'Uploading...' : '📤'}
          </button>
          <button
            type="button"
            onClick={handleClearChat}
            className="btn-clear-chat"
            title="Clear chat history"
          >
            🧹
          </button>
        </div>
      </form>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div className="lightbox-modal" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setSelectedImage(null)}>
              ✕
            </button>
            <img 
              src={selectedImage} 
              alt="full-size" 
              className="lightbox-image"
              onError={(e) => {
                console.error('Image failed to load');
                console.error('Attempted URL:', selectedImage);
                toast.error('Failed to load image: ' + selectedImage);
              }}
              onLoad={() => {
                console.log('✅ Image loaded successfully:', selectedImage);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
