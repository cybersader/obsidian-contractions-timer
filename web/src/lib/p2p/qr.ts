/**
 * QR code generation (static import — avoids dynamic chunk fetch failures in PWA).
 */
import QRCode from 'qrcode';

export async function QRCodeToDataURL(text: string): Promise<string> {
	return QRCode.toDataURL(text, {
		width: 200,
		margin: 2,
		color: {
			dark: '#000000',
			light: '#ffffff',
		},
	});
}
