<template>
  <div class="hello">
    <h1 @click="showWrappedKey()">{{ msg }}</h1>
    <h3 @click="startDexie()">Make dexie test</h3>
    <h3 @click="addDexie()">Add Item base64</h3>
    <h3 @click="addDexie2()">Add Item raw</h3>
    <h3 @click="resetDexie()">Cleanup dexie test</h3>
    <h3 @click="signup()">Register</h3>
    <h3 @click="activate()">Activate</h3>
    <h3 @click="login()">Login</h3>
    <h3 @click="logout()">Logout</h3>
    <h3 @click="getFreeSpace()">Free</h3>

    <input type="text" v-model="activationCode" placeholder="activationCode" />
    <br /><br /><br />
    <textarea v-model="cData" style="height: 600px; width: 360px" readonly></textarea>
    <p>
      For a guide and recipes on how to configure / customize this project,<br />
      check out the
      <a href="https://cli.vuejs.org" target="_blank" rel="noopener">vue-cli documentation</a>.
    </p>
    <h3>Installed CLI Plugins</h3>
    <ul>
      <li>
        <a
          href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-babel"
          target="_blank"
          rel="noopener"
          >babel</a
        >
      </li>
      <li>
        <a
          href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-typescript"
          target="_blank"
          rel="noopener"
          >typescript</a
        >
      </li>
      <li>
        <a
          href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-pwa"
          target="_blank"
          rel="noopener"
          >pwa</a
        >
      </li>
      <li>
        <a
          href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-vuex"
          target="_blank"
          rel="noopener"
          >vuex</a
        >
      </li>
      <li>
        <a
          href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint"
          target="_blank"
          rel="noopener"
          >eslint</a
        >
      </li>
      <li>
        <a
          href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-unit-jest"
          target="_blank"
          rel="noopener"
          >unit-jest</a
        >
      </li>
      <li>
        <a
          href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-e2e-cypress"
          target="_blank"
          rel="noopener"
          >e2e-cypress</a
        >
      </li>
    </ul>
    <h3>Essential Links</h3>
    <ul>
      <li>
        <a href="https://vuejs.org" target="_blank" rel="noopener">Core Docs</a>
      </li>
      <li>
        <a href="https://forum.vuejs.org" target="_blank" rel="noopener">Forum</a>
      </li>
      <li>
        <a href="https://chat.vuejs.org" target="_blank" rel="noopener">Community Chat</a>
      </li>
      <li>
        <a href="https://twitter.com/vuejs" target="_blank" rel="noopener">Twitter</a>
      </li>
      <li>
        <a href="https://news.vuejs.org" target="_blank" rel="noopener">News</a>
      </li>
    </ul>
    <h3>Ecosystem</h3>
    <ul>
      <li>
        <a href="https://router.vuejs.org" target="_blank" rel="noopener">vue-router</a>
      </li>
      <li>
        <a href="https://vuex.vuejs.org" target="_blank" rel="noopener">vuex</a>
      </li>
      <li>
        <a href="https://github.com/vuejs/vue-devtools#vue-devtools" target="_blank" rel="noopener">vue-devtools</a>
      </li>
      <li>
        <a href="https://vue-loader.vuejs.org" target="_blank" rel="noopener">vue-loader</a>
      </li>
      <li>
        <a href="https://github.com/vuejs/awesome-vue" target="_blank" rel="noopener">awesome-vue</a>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { encryptKey } from '@/lib/crypto/wrapping';
import { randomUUID } from '@/lib/crypto/webcrypto';
import Dexie from 'dexie';
import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
//import AmazonCognitoIdentity from 'amazon-cognito-identity-js';

const poolId = 'eu-central-1_ClVkXunWm';
const clientId = '7nqg1shg3m4be4jcega4u1oprm';
const username = 'testuser';
const password = 'testpwd';
const email = 'mh88@mailbox.org';

const format = (raw: number): string => {
  const mbRounded = Math.round((raw / 1024 / 1024) * 100) / 100;
  return `${mbRounded} MB`;
};

@Options({
  props: {
    msg: String
  },
  data: () => {
    return {
      cData: 'click on title (headline)',
      cognitoUser: {},
      activationCode: ''
    };
  },
  methods: {
    async getFreeSpace(): Promise<void> {
      try {
        const estimate = await window.navigator.storage.estimate();
        const quota = estimate.quota;
        const usage = estimate.usage;
        const free = (quota ?? 0) - (usage ?? 0);
        alert(free);
      } catch (ex: unknown) {
        alert(JSON.stringify(window.navigator));
      }
    },
    signup(): void {
      var poolData = {
        UserPoolId: poolId, // Your user pool id here
        ClientId: clientId // Your client id here
      };
      var userPool = new CognitoUserPool(poolData);
      var attributeList = [];
      var dataEmail = {
        Name: 'email',
        Value: email
      };
      var attributeEmail = new CognitoUserAttribute(dataEmail);
      attributeList.push(attributeEmail);
      userPool.signUp(username, password, attributeList, [], (err, result) => {
        if (err) {
          alert(err.message || JSON.stringify(err));
          return;
        }
        var cognitoUser = result?.user;
        console.log('user name is ' + cognitoUser?.getUsername());
      });
    },

    login(): void {
      var authenticationData = {
        Username: username,
        Password: password
      };
      var authenticationDetails = new AuthenticationDetails(authenticationData);
      var poolData = {
        UserPoolId: poolId, // Your user pool id here
        ClientId: clientId // Your client id here
      };
      var userPool = new CognitoUserPool(poolData);
      var userData = {
        Username: username,
        Pool: userPool
      };
      this.cognitoUser = new CognitoUser(userData);
      this.cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result: any) {
          var accessToken = result.getAccessToken().getJwtToken();
          console.log(accessToken);
        },
        onFailure: function (err: any) {
          alert(err.message || JSON.stringify(err));
        }
      });
    },

    activate(): void {
      var poolData = {
        UserPoolId: poolId, // Your user pool id here
        ClientId: clientId // Your client id here
      };

      var userPool = new CognitoUserPool(poolData);
      var userData = {
        Username: username,
        Pool: userPool
      };

      var cognitoUser = new CognitoUser(userData);
      cognitoUser.confirmRegistration(this.activationCode, true, function (err, result) {
        if (err) {
          alert(err.message || JSON.stringify(err));
          return;
        }
        console.log('call result: ' + result);
      });
    },

    logout(): void {
      this.cognitoUser.signOut();
    },

    async startDexie(): Promise<void> {
      const db = new Dexie('test');
      db.version(1).stores({
        bin: '++id, buffer'
      });
      const buffer = Buffer.from(new Uint8Array(32)).toString('base64');
      await db.table('bin').add({ buffer });
      db.close();
      console.log('created');
    },
    async addDexie(): Promise<void> {
      const db = new Dexie('test');
      db.version(1).stores({
        bin: '++id, buffer'
      });
      const buffer = Buffer.from(new Uint8Array(2 * 1024 * 1024)).toString('base64');
      await db.table('bin').add({ buffer });
      const estimate = await navigator.storage.estimate();
      console.log('1: ' + format(estimate.usage ?? 0));
      db.close();
    },
    async addDexie2(): Promise<void> {
      const db = new Dexie('test');
      db.version(1).stores({
        bin: '++id, buffer'
      });
      const buffer = new Uint8Array(2 * 1024 * 1024);
      await db.table('bin').add({ buffer });
      const estimate = await navigator.storage.estimate();
      console.log('2: ', format(estimate.usage ?? 0));
      db.close();
    },
    async resetDexie(): Promise<void> {
      Dexie.delete('test');
      const estimate = await navigator.storage.estimate();
      console.log(format(estimate.usage ?? 0));
    },
    async showWrappedKey(): Promise<void> {
      try {
        const testVector = {
          key: new Uint8Array(Buffer.from('00112233445566778899AABBCCDDEEFF000102030405060708090A0B0C0D0E0F', 'hex')),
          kek: new Uint8Array(Buffer.from('000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F', 'hex')),
          wrappedKey: Buffer.from(
            '28C9F404C4B810F4CBCCB35CFB87F8263F5786E2D80ED326CBC7F0E71A99F43BFB988B9B7A02DD21',
            'hex'
          ).toString('base64')
        };

        const { key, kek, wrappedKey } = testVector;
        const actualWrappedKey = await encryptKey(key, kek);

        console.log({ key, kek, wrappedKey, actualWrappedKey });
        console.log({ uuid: randomUUID() });

        const all = { key, kek, wrappedKey, actualWrappedKey, uuid: randomUUID() };
        this.cData = JSON.stringify(all);
      } catch (ex: unknown) {
        this.cData = 'ein Fehler: ' + ex; //JSON.stringify(ex);
        alert(ex);
      }
    }
  }
})
export default class HelloWorld extends Vue {
  msg!: string;
  cData!: string;
  activationCode!: string;
  getFreeSpace!: () => void;
  signup!: () => void;
  login!: () => void;
  logout!: () => void;
  activate!: () => void;
  showWrappedKey!: () => void;
  startDexie!: () => void;
  addDexie!: () => void;
  addDexie2!: () => void;
  resetDexie!: () => void;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
