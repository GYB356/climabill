# ClimaBill User Guide: Blockchain Features

ClimaBill offers advanced blockchain integration for transparent and verifiable invoice management and carbon tracking. This guide will help you understand and use the blockchain features effectively.

## Table of Contents

1. [Introduction to Blockchain in ClimaBill](#introduction-to-blockchain-in-climabill)
2. [Blockchain Dashboard](#blockchain-dashboard)
3. [Wallet Management](#wallet-management)
   - [Creating a New Wallet](#creating-a-new-wallet)
   - [Importing an Existing Wallet](#importing-an-existing-wallet)
   - [Viewing Wallet Details and Balances](#viewing-wallet-details-and-balances)
   - [Wallet Security](#wallet-security)
4. [Blockchain Invoices](#blockchain-invoices)
   - [Creating a Blockchain Invoice](#creating-a-blockchain-invoice)
   - [Tracking Invoice Status](#tracking-invoice-status)
   - [Receiving Payments](#receiving-payments)
   - [Verifying Transactions](#verifying-transactions)
5. [IPFS Integration](#ipfs-integration)
6. [Frequently Asked Questions](#frequently-asked-questions)

## Introduction to Blockchain in ClimaBill

ClimaBill uses blockchain technology to provide:

- **Transparency**: All transactions are recorded on a public blockchain, making them verifiable by anyone
- **Security**: Cryptographic security ensures that your invoice data cannot be tampered with
- **Immutability**: Once recorded, invoice and payment data cannot be altered
- **Decentralization**: No single entity controls the data, ensuring long-term accessibility

ClimaBill currently supports both **Ethereum** and **Polkadot** networks, with options to use either mainnet (production) or testnet (development) environments.

## Blockchain Dashboard

The Blockchain Dashboard is your central hub for all blockchain-related activities in ClimaBill:

1. Navigate to "Blockchain" in the main sidebar menu
2. The dashboard displays:
   - Overview of your blockchain wallets and balances
   - Recent blockchain invoices and their status
   - Educational content about blockchain technology
   - Quick access to wallet management and invoice creation

![Blockchain Dashboard](../images/blockchain-dashboard.png)

## Wallet Management

### Creating a New Wallet

To create a new blockchain wallet:

1. Go to "Blockchain" > "Wallet Management"
2. Click "Create New Wallet"
3. Select the blockchain network (Ethereum or Polkadot)
4. Create a strong password to encrypt your wallet
5. Click "Generate Wallet"
6. **IMPORTANT**: Write down your recovery phrase (mnemonic) and store it in a secure location. This is the only way to recover your wallet if you forget your password.
7. Confirm your recovery phrase by selecting the words in the correct order
8. Click "Complete Setup"

Your new wallet will be created and added to your account.

### Importing an Existing Wallet

If you already have an Ethereum or Polkadot wallet, you can import it into ClimaBill:

1. Go to "Blockchain" > "Wallet Management"
2. Click "Import Wallet"
3. Select the blockchain network (Ethereum or Polkadot)
4. Choose the import method:
   - Recovery phrase (mnemonic)
   - Private key
5. Enter your recovery phrase or private key
6. Create a password to encrypt your wallet in ClimaBill
7. Click "Import Wallet"

### Viewing Wallet Details and Balances

To view your wallet details and balances:

1. Go to "Blockchain" > "Wallet Management"
2. Select a wallet from your list
3. Enter your wallet password to unlock it
4. View your wallet details:
   - Public address
   - Current balance
   - Transaction history
   - Network information

### Wallet Security

ClimaBill takes wallet security seriously:

- Your private keys and mnemonics are encrypted using AES-256 encryption
- Keys are only decrypted temporarily when you unlock your wallet with your password
- Wallets automatically lock after 15 minutes of inactivity
- All sensitive data is stored locally in your browser and never sent to our servers unencrypted

**Best Practices:**
- Use a strong, unique password for each wallet
- Never share your recovery phrase or private key with anyone
- Store your recovery phrase in a secure, offline location
- Consider using a hardware wallet for large balances

## Blockchain Invoices

### Creating a Blockchain Invoice

To create an invoice on the blockchain:

1. Go to "Blockchain" > "Invoices"
2. Click "Create Blockchain Invoice"
3. Fill in the invoice details:
   - Customer information
   - Invoice items and amounts
   - Due date
   - Additional notes
4. Select the wallet to use for this invoice
5. Enter your wallet password to unlock it
6. Click "Create Invoice"
7. Confirm the transaction details and gas fees (for Ethereum)
8. Click "Confirm and Deploy"

The invoice will be created as a smart contract on the blockchain, and the invoice data will be stored on IPFS. You'll receive a confirmation once the transaction is mined.

### Tracking Invoice Status

To track the status of your blockchain invoices:

1. Go to "Blockchain" > "Invoices"
2. View the list of all your blockchain invoices
3. Click on an invoice to see its details:
   - Current status (pending, paid, cancelled)
   - Transaction hash and block information
   - Payment history
   - IPFS link to the invoice data

### Receiving Payments

When a customer pays a blockchain invoice:

1. They can pay directly to the smart contract address using their own wallet
2. The smart contract automatically records the payment
3. You'll receive a notification when payment is received
4. The invoice status will update to "Paid"

### Verifying Transactions

To verify a blockchain transaction:

1. Go to "Blockchain" > "Invoices"
2. Select the invoice you want to verify
3. Click "View on Block Explorer"
4. You'll be redirected to the appropriate block explorer (Etherscan for Ethereum, Polkadot Explorer for Polkadot)
5. Verify the transaction details on the public blockchain

## IPFS Integration

ClimaBill uses the InterPlanetary File System (IPFS) to store invoice data in a decentralized manner:

- Invoice details are stored on IPFS and only the hash is recorded on the blockchain
- This approach reduces gas costs while maintaining data integrity
- IPFS data is pinned to ensure long-term availability
- You can access the raw invoice data by clicking "View on IPFS" in the invoice details

ClimaBill supports multiple IPFS pinning services including Pinata, Infura, and Web3.Storage to ensure redundancy and availability.

## Frequently Asked Questions

**Q: Are my private keys safe?**
A: Yes. Your private keys are encrypted with your password and are only decrypted temporarily when you unlock your wallet. They are never sent to our servers in an unencrypted form.

**Q: What happens if I forget my wallet password?**
A: You can recover your wallet using the recovery phrase (mnemonic) that you saved when creating the wallet. If you've lost both your password and recovery phrase, unfortunately, the funds in that wallet cannot be recovered.

**Q: Which networks are supported?**
A: ClimaBill currently supports Ethereum (mainnet and testnets) and Polkadot. We plan to add support for more networks in the future.

**Q: How much does it cost to create a blockchain invoice?**
A: Creating a blockchain invoice requires paying gas fees on the Ethereum network. The exact cost varies depending on network congestion. On Polkadot, the fees are typically much lower. ClimaBill displays the estimated fee before you confirm the transaction.

**Q: Can I use my hardware wallet with ClimaBill?**
A: Yes, we're working on adding support for hardware wallets like Ledger and Trezor in an upcoming release.

**Q: Is the invoice data public?**
A: Yes, data stored on a public blockchain and IPFS is publicly accessible. However, sensitive customer information is encrypted before being stored on IPFS.

For additional help with blockchain features, please contact our support team at blockchain-support@climabill.com.
