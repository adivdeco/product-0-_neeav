import OneSignal from "react-onesignal";

const NotificationSubscribeButton = () => {
    const handleSubscribe = async () => {
        try {
            await OneSignal.showSlidedownPrompt();
        } catch (error) {
            console.error("OneSignal subscription error:", error);
        }
    };

    return (
        <div className=" absolute right-0 ">
            <button
                onClick={handleSubscribe}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all duration-200"
            >
                Enable Notifications
            </button>
        </div>

    );
};

export default NotificationSubscribeButton;


