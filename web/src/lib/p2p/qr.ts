/**
 * Lazy-loaded QR code generation.
 * Keeps the qrcode library out of the main bundle.
 */

export async function QRCodeToDataURL(text: string): Promise<string> {
	const QRCode = await import('qrcode');
	return QRCode.toDataURL(text, {
		width: 200,
		margin: 2,
		color: {
			dark: '#000000',
			light: '#ffffff',
		},
	});
}
