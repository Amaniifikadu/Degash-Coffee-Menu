import { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QRGeneratorPage = () => {
  const [tableNumber, setTableNumber] = useState('1');
  const canvasWrapperRef = useRef(null);

  // Customers scan this and land directly on their table's menu
  const menuUrl = `${window.location.origin}/menu?table=${tableNumber}`;

  const handleDownload = () => {
    const canvas = canvasWrapperRef.current?.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `table-${tableNumber}-qr.png`;
    link.click();
  };

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>QR code generator</h2>
      <p style={{ color: 'var(--ink-soft)' }}>
        Enter a table number to generate a QR code that opens that table's menu directly.
      </p>

      <label style={{ fontSize: '0.85rem' }}>Table number</label>
      <input
        type="number"
        min="1"
        value={tableNumber}
        onChange={(e) => setTableNumber(e.target.value)}
        style={{ width: '100%', marginBottom: '1rem' }}
      />

      <div className="ticket" style={{ textAlign: 'center' }} ref={canvasWrapperRef}>
        <QRCodeCanvas value={menuUrl} size={220} bgColor="#ffffff" fgColor="#14201b" level="M" includeMargin />
        <p className="table-stamp" style={{ marginTop: '0.75rem' }}>Table {tableNumber}</p>
        <p style={{ fontSize: '0.75rem', wordBreak: 'break-all', color: 'var(--ink-soft)' }}>{menuUrl}</p>
      </div>

      <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }} onClick={handleDownload}>
        Download PNG
      </button>
    </div>
  );
};

export default QRGeneratorPage;