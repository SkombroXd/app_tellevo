import { CapacitorConfig } from '@capacitor/cli';



const config: CapacitorConfig = {

  appId: 'io.ionic.starter',

  appName: 'myApp',

  webDir: 'www',

  server: {

    androidScheme: 'https'

  },

  plugins: {

    Geolocation: {

      permissions: ['location']

    }

  }

};



export default config;


