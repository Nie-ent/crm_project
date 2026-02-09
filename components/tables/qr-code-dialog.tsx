'use client'

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { QrCode, Printer } from "lucide-react"
import QRCode from "react-qr-code"

interface QRCodeDialogProps {
    tableId: string
    tableName: string
    storeId: string
    storeName: string
}

export function QRCodeDialog({ tableId, tableName, storeId, storeName }: QRCodeDialogProps) {
    // Construct the URL
    // In production, this needs the real domain. For now we use window.location.origin if available, or just a path
    // Ideally we want: https://<domain>/store/<storeId>?tableId=<tableId>

    // We'll generate a relative path for the component, but the QR code needs a full URL.
    // We can assume the host is where the dashboard is running for now.

    const url = typeof window !== 'undefined'
        ? `${window.location.origin}/store/${storeId}?tableId=${tableId}`
        : `/store/${storeId}?tableId=${tableId}`

    const handlePrint = () => {
        const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>QR Code - ${tableName}</title>
                        <style>
                            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; }
                            h1 { margin-bottom: 10px; font-size: 24px; }
                            p { margin-top: 5px; color: #555; }
                            svg { max-width: 300px; height: auto; }
                        </style>
                    </head>
                    <body>
                        <h1>${storeName}</h1>
                        <div id="qr-code"></div>
                        <h2>${tableName}</h2>
                        <p>Scan to Order</p>
                        <script>
                           // We need to render the QR code here again or pass it as image
                           // Simplest for print is to just rely on the user printing the dialog or using a more robust print lib
                           // For MVP, we'll just showing instructions
                           document.body.innerHTML += '<p>Please use system print dialog to print this page.</p>'
                        </script>
                    </body>
                </html>
            `)
            // In a real app we'd convert the SVG to image data URL and inject it.
            // For MVP, checking the dialog is enough.
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Code
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Table: {tableName}</DialogTitle>
                    <DialogDescription>
                        Scan this code to order from this table.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-6 space-y-4 bg-white rounded-lg border">
                    <QRCode
                        value={url}
                        size={200}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                    />
                    <p className="text-sm font-mono text-muted-foreground break-all text-center">
                        {url}
                    </p>
                </div>
                {/* <DialogFooter>
                    <Button onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </Button>
                </DialogFooter> */}
            </DialogContent>
        </Dialog>
    )
}
