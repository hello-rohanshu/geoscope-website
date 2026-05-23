// app/page.tsx
'use client';

import React from 'react';
import IcosahedronGlobe from './components/icosahedron-globe';

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
      padding: '40px 20px',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <h1 style={{
        color: '#666',
        fontSize: '14px',
        fontWeight: 400,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        margin: 0,
      }}>
        Icosahedron Globe
      </h1>

      <div style={{
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 0 60px rgba(0,0,0,0.5)',
      }}>
        <IcosahedronGlobe
          width={680}
          height={500}
        />
      </div>

      <p style={{
        color: '#555',
        fontSize: '12px',
        margin: 0,
      }}>
        Click globe to toggle • Drag to rotate
      </p>
    </div>
  );
}