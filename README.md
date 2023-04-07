# Coinbase Multisig Vault recovery tool 
This is an updated coinbase/multisig-tool project that fixes some of the broken things (mainly the API calls) so that it works in 2023.

## Usage
The usage is 1:1 same as with the old tool. For complete instructions, visit https://github.com/coinbase/multisig-tool/blob/master/README.md

In short:
- downlaod & run the project with `make run`
- input your xpubs in step 1, then (optionally) go offline and input the rest for step 2
- raw transaction will be generated. You can use https://coinb.in/ to verify that it's looking good 
- broadcast raw transaction using any bitcoin client (for example, run `broadcast("....")` in Electrum console)
- you are done!

If this helped you recover your lost funds, please consider a small donation -  3Kd34m5TUL6GJDkPeU7Abd7vzcmTmzvaDH

