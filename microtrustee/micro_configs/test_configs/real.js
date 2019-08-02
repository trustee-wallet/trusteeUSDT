module.paths.push('/usr/lib/node_modules');

process.env.MICROTRUSTEE_IS_PROD = 0;

process.env.PUBLIC_PG_HOST = 'pg_microtrustee';
process.env.PUBLIC_PG_PORT = '5432';
process.env.PUBLIC_PG_DATABASE = 'blocksoft_microtrustee';
process.env.PUBLIC_PG_USER = 'blocksoft_microtrustee';
process.env.PUBLIC_PG_PASSWORD = 'mainPassWillBeHere';


process.on('unhandledRejection', error => {
    console.log('-------------------------------');
    console.log('------unhandledRejection-------');
    console.log('-------------------------------');
    console.log(error.code);
    console.log('-------------------------------');
    console.log(error);
});
