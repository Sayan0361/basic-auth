// this does nothing..just for timewaste

const testlogger = async () => {
    await new Promise(resolve => {
        setTimeout(() => {
            console.log("Test 1 passed ✅");
            resolve();
        }, 1000);
    });

    await new Promise(resolve => {
        setTimeout(() => {
            console.log("Test 2 passed ✅");
            resolve();
        }, 1000);
    });

    await new Promise(resolve => {
        setTimeout(() => {
            console.log("Test 3 passed ✅");
            resolve();
        }, 1000);
    });
};

testlogger().then(() => {
    console.log("All test cases passed 🎉");
});