#!/usr/bin/env node

/**
 * GitHub Token Test Script
 *
 * Tests if your GitHub token has the correct permissions
 * Run: node test-github-token.js YOUR_TOKEN_HERE
 */

const token = process.argv[2];

if (!token) {
  console.error('❌ Usage: node test-github-token.js YOUR_TOKEN_HERE');
  process.exit(1);
}

async function testGitHubToken() {
  console.log('🔍 Testing GitHub token permissions...\n');

  try {
    // Test 1: Basic authentication
    console.log('1️⃣ Testing authentication...');
    const authResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!authResponse.ok) {
      throw new Error(`Auth failed: ${authResponse.status} ${authResponse.statusText}`);
    }

    const user = await authResponse.json();
    console.log(`✅ Authenticated as: ${user.login}`);

    // Test 2: Repository access
    console.log('\n2️⃣ Testing repository access...');
    const repoResponse = await fetch('https://api.github.com/repos/WebAsAService/base-template', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!repoResponse.ok) {
      throw new Error(`Repo access failed: ${repoResponse.status} ${repoResponse.statusText}`);
    }

    const repo = await repoResponse.json();
    console.log(`✅ Repository access: ${repo.full_name}`);

    // Test 3: Workflow dispatch (dry run)
    console.log('\n3️⃣ Testing workflow dispatch permissions...');
    const workflowResponse = await fetch('https://api.github.com/repos/WebAsAService/base-template/actions/workflows', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!workflowResponse.ok) {
      throw new Error(`Workflow access failed: ${workflowResponse.status} ${workflowResponse.statusText}`);
    }

    const workflows = await workflowResponse.json();
    console.log(`✅ Workflow access: Found ${workflows.total_count} workflows`);

    // Test 4: Repository dispatch endpoint
    console.log('\n4️⃣ Testing repository dispatch endpoint...');
    const dispatchResponse = await fetch('https://api.github.com/repos/WebAsAService/base-template/dispatches', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_type: 'test-permissions',
        client_payload: { test: true }
      })
    });

    if (dispatchResponse.status === 204) {
      console.log('✅ Repository dispatch: Permission granted');
    } else if (dispatchResponse.status === 404) {
      console.log('⚠️  Repository dispatch: Endpoint not found (may need to be created)');
    } else {
      console.log(`⚠️  Repository dispatch: ${dispatchResponse.status} ${dispatchResponse.statusText}`);
    }

    console.log('\n🎉 Token test completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Add this token to your .env.development file');
    console.log('2. Add this token to your production environment variables');
    console.log('3. Set up webhook URL in base-template repository');

  } catch (error) {
    console.error('\n❌ Token test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify token has "repo" and "workflow" scopes');
    console.log('2. Check token hasn\'t expired');
    console.log('3. Ensure you have access to WebAsAService/base-template repository');
  }
}

testGitHubToken();