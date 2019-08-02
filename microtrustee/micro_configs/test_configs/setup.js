module.paths.push('/usr/lib/node_modules');

process.env.MICROTRUSTEE_IS_PROD = 0;

// protection of broking production in tests checks
process.env.PUBLIC_PG_HOST = '{YOUR_DB_IP}';
process.env.PUBLIC_PG_PORT = '4439';
process.env.PUBLIC_PG_DATABASE = 'blocksoft_microtrustee_tests';
process.env.PUBLIC_PG_USER = 'blocksoft_microtrustee_tests';
process.env.PUBLIC_PG_PASSWORD = 'somePassWillBeHere';

process.env.TESTS_PG_HOST = '{YOUR_DB_IP}';
process.env.TESTS_PG_PORT = '4439';
process.env.TESTS_PG_DATABASE = 'blocksoft_microtrustee_tests';
process.env.TESTS_PG_USER = 'blocksoft_microtrustee_tests';
process.env.TESTS_PG_PASSWORD = 'somePassWillBeHere';

process.on('unhandledRejection', error => {
    console.log('-------------------------------');
    console.log('------unhandledRejection-------');
    console.log('-------------------------------');
    console.log(error.code);
    console.log('-------------------------------');
    console.log(error);
});
