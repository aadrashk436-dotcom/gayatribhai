export function downloadOrderInvoice(orderId: string) {
  if (typeof window === "undefined" || !orderId) return
  const cleanId = orderId.trim()
  const downloadUrl = `/api/orders/invoice?id=${encodeURIComponent(cleanId)}`
  
  const a = document.createElement("a")
  a.href = downloadUrl
  a.setAttribute("download", `Invoice-${cleanId}.pdf`)
  a.setAttribute("target", "_blank")
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
