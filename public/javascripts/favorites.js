document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.favorite-btn').forEach(button => {
        button.addEventListener('click', async function() {
            const contentType = this.dataset.contentType;
            const contentId = this.dataset.contentId;
            const roomId = this.dataset.roomId;
            const icon = this.querySelector('i');
            
            try {
                const response = await fetch('/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        contentType, 
                        contentId: contentId || null,
                        roomId: roomId || null
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // 切换心形图标状态
                    if (icon.classList.contains('bi-heart')) {
                        icon.classList.replace('bi-heart', 'bi-heart-fill');
                    } else {
                        icon.classList.replace('bi-heart-fill', 'bi-heart');
                    }
                    
                    // 显示成功消息
                    showToast('Added to favorites!');
                } else {
                    showToast(result.message || 'Action failed', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('Server error', 'error');
            }
        });
    });
});

function showToast(message, type = 'success') {
    // 实现一个简单的toast通知
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}