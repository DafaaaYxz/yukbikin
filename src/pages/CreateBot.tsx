import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Bot } from '../types';
import { saveBot } from '../utils/storage';

const CreateBot: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    persona: '',
    imageUrl: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newBot: Bot = {
      id: uuidv4(),
      name: formData.name,
      description: formData.description,
      persona: formData.persona,
      imageUrl: formData.imageUrl,
      createdAt: new Date(),
      creator: 'User' // Bisa diganti dengan sistem auth nanti
    };

    saveBot(newBot);
    
    // Redirect ke halaman chat bot
    navigate(`/chat/${newBot.id}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="create-bot-page">
      <h1>Create AI Bot Anda</h1>
      <form onSubmit={handleSubmit} className="bot-form">
        <div className="form-group">
          <label>Nama Bot:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Masukkan nama untuk bot Anda"
          />
        </div>

        <div className="form-group">
          <label>Deskripsi:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Deskripsikan bot Anda"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Persona (Karakter):</label>
          <textarea
            name="persona"
            value={formData.persona}
            onChange={handleChange}
            required
            placeholder="Contoh: Anda adalah asisten AI yang ramah dan helpful. Anda suka membantu pengguna dengan berbagai pertanyaan."
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>URL Gambar Profil:</label>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            required
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <button type="submit" className="create-button">
          Create Bot
        </button>
      </form>
    </div>
  );
};

export default CreateBot;
