
# JDR-web

This repository represents what is hosted on https://jdr.nlnetlabs.nl

While it only contains generated front-end code, we do track both front-end and
back-end issues here. For more in-depth discussions please consider the [RPKI
mailing list](https://lists.nlnetlabs.nl/mailman/listinfo/rpki).


## What is (not yet) validated by JDR

 -  ASN.1 encoding and structure for:
     - [X] filetypes .cer (resource/CA), .mft, .crl, .roa
     - [ ] filetypes .cer (router certficate), .gbr 
 - [X] File hashes on manifest
 - [X] Certificate / Signed Object signatures
 - [X] Resource coverage
 - [ ] Time-related validity (notBefore/notAfter/thisUpdate/nextUpdate)
 - [ ] CMS messageDigest 
 - [ ] Certificate revocation


## Thank you RIPE NCC <3

This project is partly funded by the [RIPE NCC Community Projects
Fund](https://www.ripe.net/support/cpf/ripe-ncc-community-projects-fund).
