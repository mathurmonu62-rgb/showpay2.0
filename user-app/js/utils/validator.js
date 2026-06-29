export const validator = {
    isMobile(str) {
        return /^[0-9]{10}$/.test(str);
    },
    isMpin(str) {
        return /^[0-9]{4}$/.test(str);
    }
};
