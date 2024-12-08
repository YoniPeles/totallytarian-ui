import React, { useEffect, useState } from 'react';

const ANNOUNCEMENT_TYPES = {
    NOMINATION: 'nomination',
    EXECUTION_CALL: 'execution_call',
    EXECUTION_RESULT: 'execution_result',
    POLICY_RESULT: 'policy_result',
    GAME_END: 'game_end',
    VOTE_RESULT_APPROVED: 'vote_result_approved',
    VOTE_RESULT_REJECTED: 'vote_result_rejected'
};

const AnnouncementScreen = ({ announcement, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
        if (announcement) {
            setIsVisible(true);
            // Auto-close after 5 seconds unless it's a game end announcement
            if (announcement.type !== ANNOUNCEMENT_TYPES.GAME_END) {
                const timer = setTimeout(() => {
                    handleClose();
                }, 5000);
                return () => clearTimeout(timer);
            }
        }
    }, [announcement]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 500); // Wait for fade out animation
    };

    if (!announcement || !isVisible) return null;

    const renderAnnouncementContent = () => {
        switch (announcement.type) {
            case ANNOUNCEMENT_TYPES.NOMINATION:
                return (
                    <>
                        <h2 className="text-4xl font-bold mb-4">Presidential Nomination</h2>
                        <p className="text-2xl">
                            Comrade <span className="text-red-500">{announcement.presidentName}</span> has been nominated as President
                        </p>
                    </>
                );

            case ANNOUNCEMENT_TYPES.EXECUTION_CALL:
                return (
                    <>
                        <h2 className="text-4xl font-bold mb-4 text-red-600">⚠ EXECUTION PROPOSED ⚠</h2>
                        <p className="text-2xl">
                            Minister <span className="text-red-500">{announcement.accuserName}</span> has accused{' '}
                            <span className="text-red-500">{announcement.accusedName}</span> of thoughtcrime!
                        </p>
                    </>
                );

            case ANNOUNCEMENT_TYPES.EXECUTION_RESULT:
                return (
                    <>
                        <h2 className="text-4xl font-bold mb-4">
                            {announcement.executed ? 'EXECUTION CARRIED OUT' : 'EXECUTION DENIED'}
                        </h2>
                        <p className="text-2xl">
                            {announcement.executed ? (
                                <>Comrade <span className="text-red-500">{announcement.accusedName}</span> has been vaporized</>
                            ) : (
                                <>The Party has shown mercy</>
                            )}
                        </p>
                    </>
                );

            case ANNOUNCEMENT_TYPES.POLICY_RESULT:
                return (
                    <>
                        <h2 className="text-4xl font-bold mb-4">Policy Outcome</h2>
                        <p className="text-2xl">
                            Under President <span className="text-red-500">{announcement.presidentName}</span>,{' '}
                            Ministers <span className="text-red-500">{announcement.ministerNames}</span> have{' '}
                            {announcement.sabotaged ? (
                                <span className="text-red-500">SABOTAGED</span>
                            ) : (
                                <span className="text-green-500">IMPLEMENTED</span>
                            )}{' '}
                            the policy
                        </p>
                        <p className="text-xl mt-4 text-gray-400">
                            {announcement.sabotaged 
                                ? 'Social order decreases...' 
                                : 'The Party grows stronger!'}
                        </p>
                    </>
                );

            case ANNOUNCEMENT_TYPES.GAME_END:
                return (
                    <>
                        <h2 className="text-4xl font-bold mb-4">
                            {announcement.winner === 'thought_police' ? (
                                <span className="text-red-600">VICTORY FOR BIG BROTHER</span>
                            ) : (
                                <span className="text-blue-600">THE RESISTANCE PREVAILS</span>
                            )}
                        </h2>
                        <p className="text-2xl mb-4">{announcement.message}</p>
                        {announcement.winner !== 'thought_police' && (
                            <p className="text-xl text-gray-400">Big Brother is NOT watching you</p>
                        )}
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div 
            className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-500
                ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            <div className="absolute inset-0 bg-black opacity-90"></div>
            <div className="relative bg-gray-900 p-8 rounded-lg border-2 border-red-600 max-w-2xl w-full mx-4 text-center">
                {renderAnnouncementContent()}
                {announcement.type === ANNOUNCEMENT_TYPES.GAME_END && (
                    <button
                        onClick={handleClose}
                        className="mt-8 px-6 py-2 bg-red-600 hover:bg-red-700 rounded"
                    >
                        Close
                    </button>
                )}
            </div>
        </div>
    );
};

export default AnnouncementScreen;
export { ANNOUNCEMENT_TYPES }; 