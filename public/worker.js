
self.addEventListener("push", async (e) => {
    const data = await e.data.json()
    await self.registration.showNotification(data.title, {
        body:data.body,
        vibrate: [200, 100, 200, 100, 200, 100, 200],
    })
});