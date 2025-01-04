

exports.handler = async (event) => {
    const message = `Hello ${event.key1}!`;
    return {
        message: message,
    };
};
