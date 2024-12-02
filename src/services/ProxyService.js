class ProxyService {
    static async post(message) {
        const response = await fetch('https://jdn-relay.hiroshiaki.online:3001/api/forward_message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                session_id: '123456789'
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    }
}

export default ProxyService;
