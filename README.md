# Coinbase Multisig Vault recovery tool 
This is an updated coinbase/multisig-tool project that fixes some of the broken things (mainly the API calls) so that it works in 2023.

![Screenshot_2](https://user-images.githubusercontent.com/36133540/230774077-58b12d74-6ab1-4249-a159-4909e02d5972.png)


## Usage
The usage is 1:1 same as with the old tool. For complete instructions, visit https://github.com/coinbase/multisig-tool/blob/master/README.md

In short:
- download & run the project with `npm install` and `make run` (also you will need python to be able to run local server)
- input your xpubs in step 1, then (optionally) go offline and input the rest for step 2. NOTE: For destination address, use P2SH address (starting with "3"). Native SegWit (bech32) addresses (starting with bc1) reportedly do not work.
- raw transaction will be generated. You can use https://coinb.in/ to verify that it's looking good, mainly if the destination address is matching.
- broadcast raw transaction using any bitcoin client (for example, run `broadcast("....")` in Electrum console)
- you are done!

If this helped you recover your lost funds, please consider a small donation -  3Kd34m5TUL6GJDkPeU7Abd7vzcmTmzvaDH

