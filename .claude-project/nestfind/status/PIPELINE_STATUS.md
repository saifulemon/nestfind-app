# Fullstack Pipeline Status - nestfind

## Configuration

```yaml
project: nestfind
created: 2026-05-19
last_run: 2026-05-21T03:22:02.723Z
generation: 1
pipeline_score: 1.00
quality_target: 0.95
seed_id: null
tech_stack:
  backend: nestjs
  frontends: [react]
  dashboards: []
format_version: 3
```

## Progress

| Phase | Status | Score | Output | Loop Runs | Gate Run At | Notes |
|-------|--------|-------|--------|------------|-------------|-------|
| spec | Pending | - | - | 0 | - | - |
| init | Complete | 1.00 | 6/6 checks passed | 0 | 2026-05-21T02:47:11Z | gate-runner |
| prd | Complete | 1.00 | 6/6 checks passed | 0 | 2026-05-21T02:47:11Z | gate-runner |
| user-stories | Complete | 1.00 | 8/8 checks passed | 0 | 2026-05-21T02:47:13Z | gate-runner |
| design | Complete | 1.00 | 7/7 checks passed | 0 | 2026-05-21T02:47:11Z | gate-runner |
| database | Complete | 1.00 | 8/8 checks passed | 0 | 2026-05-21T02:47:13Z | gate-runner |
| backend | Complete | 1.00 | 36/36 checks passed | 0 | 2026-05-21T02:47:15Z | gate-runner |
| frontend | Complete | 1.00 | 29/29 checks passed | 0 | 2026-05-21T02:47:18Z | gate-runner |
| integrate | Complete | 1.00 | 18/18 checks passed | 0 | 2026-05-21T02:47:20Z | gate-runner |
| test-api | Failed | .50 | 2/4 checks passed | 0 | 2026-05-21T02:20:50Z | gate-runner |
| test-browser | Failed | 0 | 3/7 nodes | 0 | - | fullstack-2 |
| ship | Pending | - | - | 0 | - | - |

## Generation Log

| Gen | Score | Phases Run | Improved | Stagnant | Duration |
|-----|-------|-----------|----------|----------|----------|

## Artifact Hashes

| Phase | Artifact | Hash | Last Changed |
|-------|----------|------|-------------|

## Gate Proofs

| Phase | Proof File | Executed At | Score | Checks Hash |
|-------|-----------|-------------|-------|-------------|
| init | .gate-proofs/init.proof | 2026-05-19T04:57:02Z | .83 | d0fdd1c31c9f1cfaaa9235d6a4f9a0a847bda53df8f804f20dfe16a57b1cedf9 |
| init | .gate-proofs/init.proof | 2026-05-19T04:58:20Z | .83 | d0fdd1c31c9f1cfaaa9235d6a4f9a0a847bda53df8f804f20dfe16a57b1cedf9 |
| init | .gate-proofs/init.proof | 2026-05-19T04:58:46Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| init | .gate-proofs/init.proof | 2026-05-19T05:00:13Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-19T05:21:23Z | .66 | 0aed68dd56d9b71b8722e140358a110d1dd866240b809249ccfb38cf0e432649 |
| prd | .gate-proofs/prd.proof | 2026-05-19T05:22:06Z | .66 | 0aed68dd56d9b71b8722e140358a110d1dd866240b809249ccfb38cf0e432649 |
| init | .gate-proofs/init.proof | 2026-05-19T05:22:36Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-19T05:39:59Z | 1.00 | 78d1716f9393cc71a27bd364f57d2e85b9c13ec14a33be6c7d8fd028b54f461f |
| init | .gate-proofs/init.proof | 2026-05-19T07:09:50Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-19T07:09:51Z | 1.00 | 78d1716f9393cc71a27bd364f57d2e85b9c13ec14a33be6c7d8fd028b54f461f |
| database | .gate-proofs/database.proof | 2026-05-19T07:31:57Z | 1.00 | 7fbe60a4e3a944284ac643d1baa0a68d793af459a0b0fa85fe53e14ec829a27d |
| init | .gate-proofs/init.proof | 2026-05-19T07:32:18Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-19T07:32:18Z | 1.00 | 78d1716f9393cc71a27bd364f57d2e85b9c13ec14a33be6c7d8fd028b54f461f |
| database | .gate-proofs/database.proof | 2026-05-19T07:32:19Z | 1.00 | 1c894824d410c244a6b5f33aa35fab5df53cb967b96983ca414e5199099faede |
| init | .gate-proofs/init.proof | 2026-05-19T08:03:32Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-19T08:03:32Z | 1.00 | 78d1716f9393cc71a27bd364f57d2e85b9c13ec14a33be6c7d8fd028b54f461f |
| database | .gate-proofs/database.proof | 2026-05-19T08:03:33Z | 1.00 | 28101fc62ab003baa5756eb10c55bfafafeffaa3b909ba1806ff950b84d29935 |
| init | .gate-proofs/init.proof | 2026-05-19T08:26:41Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-19T08:26:41Z | 1.00 | 78d1716f9393cc71a27bd364f57d2e85b9c13ec14a33be6c7d8fd028b54f461f |
| database | .gate-proofs/database.proof | 2026-05-19T08:26:42Z | 1.00 | 7c530ac61efc41b2c316b14c3219871fb6e2102a99a8486709cf8a9b6f26a3c4 |
| init | .gate-proofs/init.proof | 2026-05-19T09:10:17Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-19T09:10:17Z | 1.00 | 78d1716f9393cc71a27bd364f57d2e85b9c13ec14a33be6c7d8fd028b54f461f |
| database | .gate-proofs/database.proof | 2026-05-19T09:10:18Z | 1.00 | 2078bef975e5fb1ed77801606125c53928b14cbc54b2d1f8aeaa65741ef80611 |
| init | .gate-proofs/init.proof | 2026-05-19T09:48:22Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-19T09:48:22Z | 1.00 | 78d1716f9393cc71a27bd364f57d2e85b9c13ec14a33be6c7d8fd028b54f461f |
| design | .gate-proofs/design.proof | 2026-05-19T09:48:22Z | .85 | f8d27f6e9a690123eba1447b160f2fdb1124bcfb964ecc7158b1ff3d5e698bc3 |
| database | .gate-proofs/database.proof | 2026-05-19T09:48:24Z | 1.00 | 5b2583d241ad1221cc1a76cf4cd753800174865dfa67724d7380af0369a94428 |
| design | .gate-proofs/design.proof | 2026-05-19T09:49:07Z | .85 | f8d27f6e9a690123eba1447b160f2fdb1124bcfb964ecc7158b1ff3d5e698bc3 |
| init | .gate-proofs/init.proof | 2026-05-19T09:49:30Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-19T09:49:30Z | 1.00 | 78d1716f9393cc71a27bd364f57d2e85b9c13ec14a33be6c7d8fd028b54f461f |
| design | .gate-proofs/design.proof | 2026-05-19T09:49:30Z | 1.00 | c18dce94fbc6d4cacedc5a4ac64297a85a48212ff99b09265a32626795e0eb1c |
| database | .gate-proofs/database.proof | 2026-05-19T09:49:31Z | 1.00 | d56081123cc103ea7425804b9f60552a676ec4144c5f2a4d4f2c74323eb1321d |
| init | .gate-proofs/init.proof | 2026-05-19T10:26:27Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-19T10:26:27Z | 1.00 | 78d1716f9393cc71a27bd364f57d2e85b9c13ec14a33be6c7d8fd028b54f461f |
| design | .gate-proofs/design.proof | 2026-05-19T10:26:27Z | 1.00 | c18dce94fbc6d4cacedc5a4ac64297a85a48212ff99b09265a32626795e0eb1c |
| database | .gate-proofs/database.proof | 2026-05-19T10:26:29Z | 1.00 | c26abb9051e8c81a9a31c56c869c36dbecd93d5375db0f52fba7ddc1bddc34d1 |
| user-stories | .gate-proofs/user-stories.proof | 2026-05-19T10:26:29Z | .50 | 224c50e2e9607d6ae05e1d20fd9cc9994aaab450a403bf15f6b0281379d52974 |
| init | .gate-proofs/init.proof | 2026-05-19T11:14:17Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-19T11:14:17Z | 1.00 | 78d1716f9393cc71a27bd364f57d2e85b9c13ec14a33be6c7d8fd028b54f461f |
| design | .gate-proofs/design.proof | 2026-05-19T11:14:17Z | 1.00 | c18dce94fbc6d4cacedc5a4ac64297a85a48212ff99b09265a32626795e0eb1c |
| database | .gate-proofs/database.proof | 2026-05-19T11:14:18Z | 1.00 | 1ac641920ac71728c9730717fd9981f8a897df15674e9243ea17159776cf4567 |
| init | .gate-proofs/init.proof | 2026-05-19T11:30:45Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-19T11:30:46Z | 1.00 | 78d1716f9393cc71a27bd364f57d2e85b9c13ec14a33be6c7d8fd028b54f461f |
| design | .gate-proofs/design.proof | 2026-05-19T11:30:46Z | 1.00 | c18dce94fbc6d4cacedc5a4ac64297a85a48212ff99b09265a32626795e0eb1c |
| database | .gate-proofs/database.proof | 2026-05-19T11:30:47Z | 1.00 | 4ab0bb4728490797dcbe9f12c1aca105abe7e541cb47438001f75b590ed16c39 |
| backend | .gate-proofs/backend.proof | 2026-05-19T11:30:49Z | .77 | 272afaa0e26314a57f7a11f0292f9e0ec013b3aa31bd2dfcc992feafdb22854f |
| init | .gate-proofs/init.proof | 2026-05-19T13:26:46Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-19T13:26:46Z | 1.00 | 78d1716f9393cc71a27bd364f57d2e85b9c13ec14a33be6c7d8fd028b54f461f |
| design | .gate-proofs/design.proof | 2026-05-19T13:26:46Z | 1.00 | c18dce94fbc6d4cacedc5a4ac64297a85a48212ff99b09265a32626795e0eb1c |
| database | .gate-proofs/database.proof | 2026-05-19T13:26:48Z | 1.00 | dd284e17d2c62d29e2678d98e3591a7c976080b9595d700cf3be388db7b1a4f3 |
| init | .gate-proofs/init.proof | 2026-05-20T02:48:24Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-20T02:48:24Z | 1.00 | 78d1716f9393cc71a27bd364f57d2e85b9c13ec14a33be6c7d8fd028b54f461f |
| design | .gate-proofs/design.proof | 2026-05-20T02:48:25Z | 1.00 | c18dce94fbc6d4cacedc5a4ac64297a85a48212ff99b09265a32626795e0eb1c |
| database | .gate-proofs/database.proof | 2026-05-20T02:48:26Z | 1.00 | 2565f0acc50db4212581f899c8fbad03fbe61102bc1eca9ff47b08e51c928a2e |
| backend | .gate-proofs/backend.proof | 2026-05-20T02:48:28Z | .70 | 73a636b66034d642790e64245d154f7333c7e1ec3ca5ca728f8488f7f94cac06 |
| init | .gate-proofs/init.proof | 2026-05-20T02:59:50Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-20T02:59:50Z | 1.00 | 78d1716f9393cc71a27bd364f57d2e85b9c13ec14a33be6c7d8fd028b54f461f |
| design | .gate-proofs/design.proof | 2026-05-20T02:59:50Z | 1.00 | 9ac922a65766b0e015d1bec3a8b8dc96859898ef61827eff4424bb968bb11d71 |
| database | .gate-proofs/database.proof | 2026-05-20T02:59:52Z | 1.00 | f4897e35790578c8e544e73354d7418d5e6e42f8c6cefefc64e60510cbe08a10 |
| user-stories | .gate-proofs/user-stories.proof | 2026-05-20T03:09:43Z | .66 | 98c1059a89dfc3890fc07d77d943f91943cc7a5d8297d1decc153fd264e058bd |
| init | .gate-proofs/init.proof | 2026-05-20T04:20:13Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-20T04:20:13Z | 1.00 | 7baf66ac66bae23d501702e3ad67cf34bba360b3d421c3b2f8d133f2126942af |
| design | .gate-proofs/design.proof | 2026-05-20T04:20:13Z | 1.00 | 9ac922a65766b0e015d1bec3a8b8dc96859898ef61827eff4424bb968bb11d71 |
| database | .gate-proofs/database.proof | 2026-05-20T04:20:15Z | 1.00 | c9b6c32032bde0971e8f8eb8fb4389ecf3b78c21bfcb2fac4b00f0ea2829c946 |
| user-stories | .gate-proofs/user-stories.proof | 2026-05-20T04:23:34Z | .66 | 98c1059a89dfc3890fc07d77d943f91943cc7a5d8297d1decc153fd264e058bd |
| user-stories | .gate-proofs/user-stories.proof | 2026-05-20T04:26:48Z | .66 | 98c1059a89dfc3890fc07d77d943f91943cc7a5d8297d1decc153fd264e058bd |
| user-stories | .gate-proofs/user-stories.proof | 2026-05-20T06:07:33Z | 1.00 | 7c999d529f5afcc30636be9aae76e0158c8a4e659072104ede34584d6ab88a06 |
| backend | .gate-proofs/backend.proof | 2026-05-20T06:07:35Z | .73 | 6dcc9e05f4a04f18f9b4241c35dbae7f3eddf15931069b119e526ecc4a7736c5 |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T06:07:39Z | .72 | 1f5d1a83f1d6c37e8a9d38b0aefbee52efaf9c4b753b1199032453edcb7932eb |
| integrate | .gate-proofs/integrate.proof | 2026-05-20T06:07:41Z | .87 | 9f3756a6f7ebaf17b9f49bcebd73a8cae2dad250da32da605daccc291c4ce900 |
| integrate | .gate-proofs/integrate.proof | 2026-05-20T06:39:58Z | .87 | ce0f487cedce7ea42079794ce40255e69a2a18b947806d506f9f0c26c8b985ff |
| integrate | .gate-proofs/integrate.proof | 2026-05-20T06:40:28Z | .93 | 8ae9db394d4a9dba80cb84a3fb24ba035c0b359a409266c376c9c481d15abb33 |
| integrate | .gate-proofs/integrate.proof | 2026-05-20T06:40:52Z | 1.00 | ce5a4e55ef6cfb923f8c04f4424cd848804ca325d2f2e66585759822cbafe438 |
| backend | .gate-proofs/backend.proof | 2026-05-20T07:42:58Z | .85 | bf24a5784a9727a5eb2b55d10020f57c18c147b5c425fa2ce17c0a89e4b70d67 |
| backend | .gate-proofs/backend.proof | 2026-05-20T07:44:33Z | .88 | 6345dbec5d1c436eeaa5c8bf49517b08c5bd5cdfe52859ed5177db7daaacee7f |
| backend | .gate-proofs/backend.proof | 2026-05-20T07:55:25Z | .88 | 65b171467407291c7156f781df53fea2e5b041725308f4d2cef7509112420d07 |
| backend | .gate-proofs/backend.proof | 2026-05-20T07:55:56Z | .94 | bb8023c83983ae04b31d321686f4c52358fe27eec3172f0c96810de3e34c1ae3 |
| backend | .gate-proofs/backend.proof | 2026-05-20T07:56:25Z | .94 | e71dad533299c55000110d7f8ac69c61fccb6907c7bba4001e267d02f899eaea |
| backend | .gate-proofs/backend.proof | 2026-05-20T07:56:50Z | 1.00 | 48929c656291b133b023e5fc1efe40fd5719cc7c513132b7b66d64144588d30f |
| init | .gate-proofs/init.proof | 2026-05-20T07:57:09Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-20T07:57:09Z | 1.00 | 7baf66ac66bae23d501702e3ad67cf34bba360b3d421c3b2f8d133f2126942af |
| design | .gate-proofs/design.proof | 2026-05-20T07:57:09Z | 1.00 | 9ac922a65766b0e015d1bec3a8b8dc96859898ef61827eff4424bb968bb11d71 |
| database | .gate-proofs/database.proof | 2026-05-20T07:57:11Z | 1.00 | 8daa3d71c73e91fc90de12b2e2d004b41ab40dc492fbdb0958e63826781a5eb8 |
| user-stories | .gate-proofs/user-stories.proof | 2026-05-20T07:57:11Z | 1.00 | 7c999d529f5afcc30636be9aae76e0158c8a4e659072104ede34584d6ab88a06 |
| backend | .gate-proofs/backend.proof | 2026-05-20T07:57:13Z | 1.00 | b2ae9b06bd54df6eea681c6eb571b0461e19221cd88a739156585e01622d50d8 |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T07:57:16Z | .68 | d724f6777b68198efd2cb9c73a17909030636c65ca8f1a71535ce173c8c4cd43 |
| integrate | .gate-proofs/integrate.proof | 2026-05-20T07:57:18Z | .88 | ab769623723bf4ae90b25ce9d8cfbc676f686d15c945adc1c1cd11c9430e7a42 |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T07:57:42Z | .68 | 42fc6be0a7c139031b9d3a640ec7fa3800d4e4f36f79e62f8ca4f365033ce8d3 |
| integrate | .gate-proofs/integrate.proof | 2026-05-20T07:57:44Z | .88 | a06240709366b22abd668bad1c772c97f3e32cc2d0a7f87648c1c873cae62127 |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T07:58:14Z | .68 | 4887baca2c084cb1a16309499422eb8baac5559ef624329b83232b2d3bd97d30 |
| integrate | .gate-proofs/integrate.proof | 2026-05-20T07:58:19Z | 1.00 | e87d687227898784c53746b245f07e00860844a6ef0caf4da710b6ef9c5eb7f3 |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T07:58:39Z | .68 | be70ceb004da184aa382c429871cf1e561838ac1365560f4d4a1db30321c9421 |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T07:58:54Z | .68 | f38ff99fd99dd055e81c57dc5e6c80d893e5bd014c65665c7c78eae94aa291a9 |
| init | .gate-proofs/init.proof | 2026-05-20T07:59:20Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-20T07:59:20Z | 1.00 | 7baf66ac66bae23d501702e3ad67cf34bba360b3d421c3b2f8d133f2126942af |
| design | .gate-proofs/design.proof | 2026-05-20T07:59:20Z | 1.00 | 9ac922a65766b0e015d1bec3a8b8dc96859898ef61827eff4424bb968bb11d71 |
| database | .gate-proofs/database.proof | 2026-05-20T07:59:21Z | 1.00 | c27aa06cca4fc7ca85c11b2ad84b54b95f2f837437de953d118cc4936aef1890 |
| user-stories | .gate-proofs/user-stories.proof | 2026-05-20T07:59:22Z | 1.00 | 7c999d529f5afcc30636be9aae76e0158c8a4e659072104ede34584d6ab88a06 |
| backend | .gate-proofs/backend.proof | 2026-05-20T07:59:24Z | 1.00 | d89ef49f6c2b650bc91d889c21654e41831a2e16ced979e9ad03e8bcdfca49ed |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T07:59:27Z | .68 | 685d7c9c7446a7db51c7cec4b7fdb3679ae6fc75c468a4cefb6617bcd40753df |
| integrate | .gate-proofs/integrate.proof | 2026-05-20T07:59:29Z | 1.00 | 2ad223b1bebd49bc1070e779602cc7ffe3746cd3034b94338d93e3325411b11e |
| test-api | .gate-proofs/test-api.proof | 2026-05-20T08:00:52Z | .50 | cd5badd6782ae4cb89ccb088cb13d1258ed567cd71e39718a6460fd0ba98cbed |
| test-browser | .gate-proofs/test-browser.proof | 2026-05-20T08:00:52Z | .25 | 69c637e745c551819c1d0536134e0a05aec8597ca1cfa331f6a0214037d39e35 |
| init | .gate-proofs/init.proof | 2026-05-20T08:01:55Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-20T08:01:56Z | 1.00 | 7baf66ac66bae23d501702e3ad67cf34bba360b3d421c3b2f8d133f2126942af |
| design | .gate-proofs/design.proof | 2026-05-20T08:01:56Z | 1.00 | 9ac922a65766b0e015d1bec3a8b8dc96859898ef61827eff4424bb968bb11d71 |
| database | .gate-proofs/database.proof | 2026-05-20T08:01:57Z | 1.00 | e806ea7a77aea224cb9842d8e5f018412875d9ae9a45085c9d1dc0985fca5257 |
| user-stories | .gate-proofs/user-stories.proof | 2026-05-20T08:01:58Z | 1.00 | 7c999d529f5afcc30636be9aae76e0158c8a4e659072104ede34584d6ab88a06 |
| backend | .gate-proofs/backend.proof | 2026-05-20T08:01:59Z | 1.00 | f23514cdda681d652fc632857ac1d309256b38374e3402976e446ddb3af1504d |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T08:02:03Z | .68 | bace1e677e424767f206fe1c339bd9835e45a58887da745487a1b062b3dff6d7 |
| integrate | .gate-proofs/integrate.proof | 2026-05-20T08:02:05Z | 1.00 | aefe5b0576fc27051261df2b2b69819a963bae2822ecf365fb2d4dca5e00dea7 |
| test-api | .gate-proofs/test-api.proof | 2026-05-20T08:03:25Z | .50 | 9d56585436307d957b0316a0d3977c76d884309203939e9fd6c40f55ebda1763 |
| test-browser | .gate-proofs/test-browser.proof | 2026-05-20T08:03:25Z | .25 | 69c637e745c551819c1d0536134e0a05aec8597ca1cfa331f6a0214037d39e35 |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T09:30:25Z | .68 | 4df78c5afebc0335c0d8b6c97089d7383c715409bd7f1069b1506d5151a58c96 |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T09:31:19Z | .75 | 4df7162a45ece0d1fb1a7d7d00bb1b53c8ed274e91ef536b5997ca03cf2a533f |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T09:32:15Z | .75 | 1b7bc6dc0e884ab8ed41baf543495dec0658ccd75581cb600c73b3a792e482c4 |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T09:32:54Z | .79 | 638f0761c0f9f632dbe1b5d7f455f4b63437f04fbf909048c264c34bc3ce648c |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T09:40:32Z | .86 | bbd9cb9d3ee6ec264c77c1cac4e116c8285412cd0ef17eec27bf3523b7ba4534 |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T09:41:46Z | .86 | ce0ce4f05c474dd861d4a69140b916690a41f65538c33282ccd29d14fa14c75d |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T09:42:36Z | .86 | c55cc05809e93d9de240d8e603d46fe51b4765643521985f5f47e46feba76266 |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T09:43:09Z | .86 | 220987fa56152d5023f91d79fae4e26aa738aa933189b67ddcc8dad05fb49ec4 |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T09:43:46Z | .86 | d77e7eecd1e940f4b141973f27a7544be970ad5a9375d9404d04c0a45168c855 |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T09:45:03Z | .89 | 2b29fcc4bf060fa7b19b76fc1a2edaa804471eb0ee50031553fb2214447f212d |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T09:45:40Z | .89 | 998589f8118b97bf3bc11946910ee6c956277b90b3911334f73fe14ce2f4804a |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T09:46:41Z | .93 | 285e1aacd8af46c132668d01bb6205c45cfecfc56313de90f0aaa1e81e7b155e |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T09:47:12Z | .93 | 13d45b59ddcdb746b16bad886a946a26e7bfbab1e9ac715eda2879bbe06a3156 |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T09:47:40Z | .93 | 7a679adea3b17d7c781988f7940cde7c44c4ee37905f09a0f08b14b54fe9b0e5 |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T09:48:06Z | .93 | 41021529fe0c01df5c4309961aa1f17aed88e796322830d1235a838e87088df1 |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T09:49:32Z | .96 | 53c7a38e6b48110601cc520ea8cba547c5f25f8fd74f39747ecce5f6979400ee |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T09:50:38Z | 1.00 | 96d82839ec551dc461951cdab00fb1d56c1d81d85fd6585f895410bd60abf65d |
| init | .gate-proofs/init.proof | 2026-05-20T09:50:57Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-20T09:50:57Z | 1.00 | 7baf66ac66bae23d501702e3ad67cf34bba360b3d421c3b2f8d133f2126942af |
| design | .gate-proofs/design.proof | 2026-05-20T09:50:57Z | 1.00 | 2c2a680676df57f3b27bd05b36668cdf8d4524f131f8ced22de7d19cab53cbd5 |
| database | .gate-proofs/database.proof | 2026-05-20T09:50:59Z | 1.00 | 53f8593ef73b3e46217c2a7214d6802ca451c7a850f4fcf4e2985e6e63326832 |
| user-stories | .gate-proofs/user-stories.proof | 2026-05-20T09:50:59Z | 1.00 | 7c999d529f5afcc30636be9aae76e0158c8a4e659072104ede34584d6ab88a06 |
| backend | .gate-proofs/backend.proof | 2026-05-20T09:51:01Z | 1.00 | 12bbc53ecc242107653159f20a1ae4bbeeb594e94224ed9acd428cf8191f78a0 |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T09:51:02Z | 1.00 | a5ac01742e620c223d5e64f638bdc44868eac1e2ac6c2a31aa58cdd99c287a00 |
| integrate | .gate-proofs/integrate.proof | 2026-05-20T09:51:04Z | 1.00 | c7688ab31cef616a438d636f9f5c569e0f8246254123e06c517f9ceb695a9434 |
| test-api | .gate-proofs/test-api.proof | 2026-05-20T09:52:24Z | .50 | 1128faf8ccd92b072da41f44f2a6d672e5025c201c48dcb16cbf5aae2c6f49a9 |
| test-browser | .gate-proofs/test-browser.proof | 2026-05-20T09:52:24Z | .25 | 69c637e745c551819c1d0536134e0a05aec8597ca1cfa331f6a0214037d39e35 |
| init | .gate-proofs/init.proof | 2026-05-20T09:52:50Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-20T09:52:51Z | 1.00 | 7baf66ac66bae23d501702e3ad67cf34bba360b3d421c3b2f8d133f2126942af |
| design | .gate-proofs/design.proof | 2026-05-20T09:52:51Z | 1.00 | 2c2a680676df57f3b27bd05b36668cdf8d4524f131f8ced22de7d19cab53cbd5 |
| database | .gate-proofs/database.proof | 2026-05-20T09:52:52Z | 1.00 | 07eb2a35e669d1e153aee1418c4d57721c38b21379992c820e15b14228cc7dd0 |
| user-stories | .gate-proofs/user-stories.proof | 2026-05-20T09:52:53Z | 1.00 | 7c999d529f5afcc30636be9aae76e0158c8a4e659072104ede34584d6ab88a06 |
| backend | .gate-proofs/backend.proof | 2026-05-20T09:52:54Z | 1.00 | 97f8f3c6d6a392e0c7c52e981e945fd25751e7add0e6eb6b5747a4efedd8c437 |
| frontend | .gate-proofs/frontend.proof | 2026-05-20T09:52:56Z | 1.00 | de90a9a91351d003a21045cb05d43ff9e85b00340a8bd6687d5c4ef8dc05c4b2 |
| integrate | .gate-proofs/integrate.proof | 2026-05-20T09:52:57Z | 1.00 | f203454e05a5c126f2bd05db6f9d935e2198520aea58edd264d659c640a0ae52 |
| init | .gate-proofs/init.proof | 2026-05-21T02:04:42Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-21T02:04:42Z | 1.00 | 7baf66ac66bae23d501702e3ad67cf34bba360b3d421c3b2f8d133f2126942af |
| design | .gate-proofs/design.proof | 2026-05-21T02:04:43Z | 1.00 | 2c2a680676df57f3b27bd05b36668cdf8d4524f131f8ced22de7d19cab53cbd5 |
| database | .gate-proofs/database.proof | 2026-05-21T02:04:44Z | 1.00 | 31289fcbc6d08c765f7cc90996241f6194295f4e0d10720eb6343e90eb178859 |
| user-stories | .gate-proofs/user-stories.proof | 2026-05-21T02:04:44Z | 1.00 | 7c999d529f5afcc30636be9aae76e0158c8a4e659072104ede34584d6ab88a06 |
| backend | .gate-proofs/backend.proof | 2026-05-21T02:04:46Z | 1.00 | ea8ef9c1c89a2cb08a88ca8ed9a242588d17cb12ef055ad165b9d46d0df42d38 |
| frontend | .gate-proofs/frontend.proof | 2026-05-21T02:04:48Z | 1.00 | 05c936bbef73d7e463eabfac2e275f4eab47b8c2220e07af745979d6d1dac01e |
| integrate | .gate-proofs/integrate.proof | 2026-05-21T02:04:49Z | 1.00 | fab57171a1851b0af66343481204adfade5dd1558b85fc35095af5d204a22529 |
| test-api | .gate-proofs/test-api.proof | 2026-05-21T02:06:13Z | .50 | 81b1227c1e6a7885e73e059ccb5f9dac06eccbe032eea28cc7fd462827cfafff |
| test-browser | .gate-proofs/test-browser.proof | 2026-05-21T02:06:14Z | .25 | 69c637e745c551819c1d0536134e0a05aec8597ca1cfa331f6a0214037d39e35 |
| init | .gate-proofs/init.proof | 2026-05-21T02:15:04Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-21T02:15:04Z | 1.00 | 7baf66ac66bae23d501702e3ad67cf34bba360b3d421c3b2f8d133f2126942af |
| design | .gate-proofs/design.proof | 2026-05-21T02:15:04Z | 1.00 | 2c2a680676df57f3b27bd05b36668cdf8d4524f131f8ced22de7d19cab53cbd5 |
| database | .gate-proofs/database.proof | 2026-05-21T02:15:06Z | 1.00 | 394256bc3fac60c114bb43f61788c576a4814cad14ea2964b6bc5fbf3a1e0695 |
| user-stories | .gate-proofs/user-stories.proof | 2026-05-21T02:15:06Z | 1.00 | 7c999d529f5afcc30636be9aae76e0158c8a4e659072104ede34584d6ab88a06 |
| backend | .gate-proofs/backend.proof | 2026-05-21T02:15:08Z | 1.00 | 8d643f0b76d03dc7191c998f3b65e402e31834e426e3357adab26454b316af64 |
| frontend | .gate-proofs/frontend.proof | 2026-05-21T02:15:11Z | .89 | 9554868fac7c92657a8b249c3d8e23d5f65cc74a63044a359db03067f7eb75b7 |
| integrate | .gate-proofs/integrate.proof | 2026-05-21T02:15:13Z | .94 | 4a2817226c10b7d34ec31a7794ef031bb5b0e68db87e0fe75aceac8362b1a8d4 |
| test-api | .gate-proofs/test-api.proof | 2026-05-21T02:16:32Z | .50 | 6c9853c193b762fc84c64d929504bae905f8201b1c59ec08011f571bec6d19e9 |
| test-browser | .gate-proofs/test-browser.proof | 2026-05-21T02:16:32Z | .25 | 69c637e745c551819c1d0536134e0a05aec8597ca1cfa331f6a0214037d39e35 |
| frontend | .gate-proofs/frontend.proof | 2026-05-21T02:16:52Z | .89 | 1a48b6f733ecf9a5015bdd996765f0059e69ded2f520c4422748e2cb989cd623 |
| integrate | .gate-proofs/integrate.proof | 2026-05-21T02:16:54Z | .94 | 990e23c3eb9fac4efc1e8152e4c3b27a641a67f4bf3d4371b2e108b0a9c6a896 |
| frontend | .gate-proofs/frontend.proof | 2026-05-21T02:17:25Z | .93 | 9a9c9849bb0e6b639e5a57840f180fd0a8aa0b69864eda3755beac684ef81643 |
| frontend | .gate-proofs/frontend.proof | 2026-05-21T02:17:49Z | .93 | 01a469f6d9bceb47db06f0ea62cbccb81f11713f59938a10eeef5203997a73f9 |
| init | .gate-proofs/init.proof | 2026-05-21T02:19:22Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-21T02:19:22Z | 1.00 | 7baf66ac66bae23d501702e3ad67cf34bba360b3d421c3b2f8d133f2126942af |
| design | .gate-proofs/design.proof | 2026-05-21T02:19:22Z | 1.00 | 2c2a680676df57f3b27bd05b36668cdf8d4524f131f8ced22de7d19cab53cbd5 |
| database | .gate-proofs/database.proof | 2026-05-21T02:19:23Z | 1.00 | 912a3119f90737d493accd79f3bc41d6096d8734a27c6be106c221628785dda8 |
| user-stories | .gate-proofs/user-stories.proof | 2026-05-21T02:19:24Z | 1.00 | 7c999d529f5afcc30636be9aae76e0158c8a4e659072104ede34584d6ab88a06 |
| backend | .gate-proofs/backend.proof | 2026-05-21T02:19:25Z | 1.00 | 540672e37e97834338fdce4bb85b28e37067613851de1030cd6f47577a82d7f5 |
| frontend | .gate-proofs/frontend.proof | 2026-05-21T02:19:28Z | 1.00 | c500c3900c73e9897cd02c60e885f030ed7fa7fd9832c0ff646153955c74e470 |
| integrate | .gate-proofs/integrate.proof | 2026-05-21T02:19:30Z | 1.00 | b16fb53507337b45403885193ce79c61491c16e1b6f7c8db9546daa96632dca5 |
| test-api | .gate-proofs/test-api.proof | 2026-05-21T02:20:50Z | .50 | 31b1fe2e70dac16be8925ad60599d6c93688de14f6f2b3ff22c0bf67267d5962 |
| test-browser | .gate-proofs/test-browser.proof | 2026-05-21T02:20:50Z | .25 | 69c637e745c551819c1d0536134e0a05aec8597ca1cfa331f6a0214037d39e35 |
| init | .gate-proofs/init.proof | 2026-05-21T02:47:11Z | 1.00 | adf3e0e6422566ca32d65a3fb7c5ac6ccea5193d0126f3bd4a2b0e23cf852771 |
| prd | .gate-proofs/prd.proof | 2026-05-21T02:47:11Z | 1.00 | 7baf66ac66bae23d501702e3ad67cf34bba360b3d421c3b2f8d133f2126942af |
| design | .gate-proofs/design.proof | 2026-05-21T02:47:11Z | 1.00 | 2c2a680676df57f3b27bd05b36668cdf8d4524f131f8ced22de7d19cab53cbd5 |
| database | .gate-proofs/database.proof | 2026-05-21T02:47:13Z | 1.00 | 6954cdfccd0b91e3d06278ac5b1ca8c33084ccad451118118233af7cf6343b33 |
| user-stories | .gate-proofs/user-stories.proof | 2026-05-21T02:47:13Z | 1.00 | 7c999d529f5afcc30636be9aae76e0158c8a4e659072104ede34584d6ab88a06 |
| backend | .gate-proofs/backend.proof | 2026-05-21T02:47:15Z | 1.00 | d73b7b2f092114fc7b4586540b64f0e200fa8b23dcaa158c7b41ae792709000d |
| frontend | .gate-proofs/frontend.proof | 2026-05-21T02:47:18Z | 1.00 | 267ff31ec4c9a835cc575803ff1c78e43ec5d0516dea3b49188fd8fb0124925a |
| integrate | .gate-proofs/integrate.proof | 2026-05-21T02:47:20Z | 1.00 | a84ba7b0dc7e06cc85d8f652097dc52bdf76ea9b417d43b5d981226253a73ea6 |

## Gate Results

Gate scripts provide deterministic, non-LLM validation after each phase.

### database — Gate Results

| Check | Result | Detail | Time |
|-------|--------|--------|------|
| entity-files-exist | PASS | count=      10 (expected >= 1) | 0ms |
| schema-compiles | PASS |  | 666ms |
| entities-have-decorator | PASS | count=       9 (expected >= 1) | 0ms |
| migrations-exist | PASS | count=       1 (expected >= 1) | 0ms |
| naming-convention | PASS |  | 18ms |
| uuid-primary-keys | PASS |        3/       3 entities use UUID PK | 0ms |
| soft-delete-support | PASS |        1 entities have soft delete | 0ms |
| prefer-enum-over-string | PASS |        0 potential string-as-enum fields | 0ms |
| **Score** | **1.00** | **2026-05-19T07:31:57Z** | |

**Fix Attempts:** _none_

### backend — Gate Results

| Check | Result | Detail | Time |
|-------|--------|--------|------|
| tsc | PASS |  | 662ms |
| controllers-exist | PASS | count=       1 (expected >= 1) | 0ms |
| services-exist | PASS | count=       3 (expected >= 1) | 0ms |
| dtos-exist | PASS | count=       2 (expected >= 1) | 0ms |
| swagger-decorators | PASS | count=       1 (expected >= 1) | 0ms |
| test-files-exist | PASS | count=       9 (expected >= 1) | 0ms |
| tests-execute | PASS |  | 242ms |
| tests-pass-rate | PASS | count=100 (expected >= 80) | 0ms |
| no-unsafe-cast | PASS |        1 unsafe casts (threshold: 3) | 0ms |
| class-validator-usage | PASS |        1/       2 DTOs have validation decorators | 0ms |
| swagger-all-controllers | PASS |        1/       1 controllers have Swagger | 0ms |
| nestjs-error-handling | PASS |        4 files use NestJS exceptions | 0ms |
| httponly-refresh-token | FAIL | no httpOnly cookie in auth/ — refreshToken must be set as httpOnly cookie, not r | 0ms |
| no-jwt-secret-fallback | PASS | no hardcoded JWT_SECRET fallback found | 0ms |
| no-direct-repo-in-service | PASS | no @InjectRepository in services — using custom repositories | 0ms |
| querybuilder-in-repo-only | PASS | no createQueryBuilder in services — queries are in repositories | 0ms |
| core-pipes-exists | PASS |  | 0ms |
| logging-interceptor-exists | PASS |  | 0ms |
| api-swagger-decorator-exists | PASS |  | 0ms |
| infrastructure-dirs | PASS | count=4 (expected >= 4) | 0ms |
| database-migrations-dir | PASS |  | 0ms |
| database-seeders-dir | PASS |  | 0ms |
| core-subdirs-complete | PASS | count=6 (expected >= 6) | 0ms |
| seed-script-exists | PASS |  | 2ms |
| seed-script-registered | PASS |  | 3ms |
| global-interceptor-registered | FAIL | TransformInterceptor NOT registered in main.ts — add app.useGlobalInterceptors(n | 0ms |
| global-filter-registered | FAIL | HttpExceptionFilter NOT registered in main.ts — add app.useGlobalFilters(new Htt | 0ms |
| infrastructure-implemented | FAIL | 1/4 infrastructure modules implemented (need >= 2) | 0ms |
| cors-credentials-enabled | FAIL | CORS credentials: true NOT found in main.ts — required for httpOnly cookie auth | 0ms |
| env-auth-cookie-vars | FAIL | .env.example file missing — required for auth cookie configuration | 0ms |
| websocket-gateway-exists | FAIL | PRD requires real-time but no @WebSocketGateway found — see nestjs/guides/websoc | 0ms |
| **Score** | **.77** | **2026-05-19T11:30:49Z** | |

**Fix Attempts:** _none_

### frontend — Gate Results

| Check | Result | Detail | Time |
|-------|--------|--------|------|
| frontend-env-example | PASS |  | 0ms |
| tsc | PASS |  | 777ms |
| build | PASS |  | 424ms |
| page-components | PASS | count=      38 (expected >= 1) | 0ms |
| html-prototype-coverage | PASS | 38 React pages / 16 HTML prototypes (>= 80% required) | 0ms |
| html-name-coverage | PASS | All 16 HTML prototypes have matching React pages (name-verified) | 0ms |
| routing-exists | PASS |  | 2ms |
| route-files-split | PASS | 4 route files found in routes/ directory | 0ms |
| no-inline-routes | PASS | routes.ts is aggregator only | 0ms |
| no-hardcoded-urls | PASS |  | 0ms |
| shared-components | PASS | count=      12 (expected >= 1) | 0ms |
| no-dead-buttons | PASS |  | 0ms |
| logo-home-link | PASS | 2/2 layouts have logo link | 0ms |
| 404-catch-all | PASS | catch-all route exists | 0ms |
| ts-strict-mode | PASS |  | 0ms |
| role-based-ui | PASS | route-level guards (3 guard component(s), 2 router file(s)); 0/38 pages also ref | 0ms |
| httpservice-env-url | PASS | httpService.ts uses VITE_API_URL | 0ms |
| httpservice-with-credentials | PASS | httpService.ts has withCredentials: true | 0ms |
| redux-extrareducers-wired | PASS | all Redux slices have functional extraReducers | 0ms |
| no-mock-data-in-pages | PASS | no hardcoded mock data found in pages | 0ms |
| empty-state-ui | PASS | 10 pages with empty state handling | 0ms |
| no-inline-domain-interfaces | PASS | all domain types are in ~/types/ | 0ms |
| no-createBrowserRouter | PASS | framework mode confirmed | 0ms |
| no-react-router-dom | PASS | all imports use react-router | 0ms |
| react-router-config-exists | PASS | react-router.config.ts exists | 0ms |
| import-alias-tilde | PASS | all imports use ~/ alias | 0ms |
| no-tanstack-query | PASS | no TanStack Query usage found | 0ms |
| source-dir-app | PASS | source directory is app/ | 0ms |
| has-stable-testids | PASS | 61/61 interactive elements have data-testid (100%, >=70% required) | 0ms |
| **Score** | **1.00** | **2026-05-20T09:50:38Z** | |

**Fix Attempts:** _none_

### integrate — Gate Results

| Check | Result | Detail | Time |
|-------|--------|--------|------|
| api-services-exist | PASS | count=      59 (expected >= 1) | 0ms |
| no-any-types | FAIL |        8 any types found (threshold: 5) | 0ms |
| error-handling | PASS | count=      21 (expected >= 1) | 0ms |
| loading-states | PASS | count=      10 (expected >= 1) | 0ms |
| tsc-after-integration | PASS |  | 1334ms |
| api-base-url-env | PASS |  | 25ms |
| api-route-matching | PASS | all frontend API paths match backend routes | 0ms |
| cors-port-consistency | PASS | CORS=unset PW=unset Vite=5173 | 0ms |
| interceptor-retry-limit | PASS |  | 0ms |
| no-settimeout-navigate | PASS |  | 0ms |
| no-hardcoded-error-messages | PASS |        0 hardcoded error messages (threshold: 2) | 0ms |
| api-contract-fields | PASS | 0 field mismatches (threshold: 10) | 0ms |
| no-inline-domain-interfaces | PASS | all domain types are in ~/types/ | 0ms |
| slices-extrareducers-functional | FAIL | 2/2 slices have empty extraReducers — must wire thunks with builder.addCase | 0ms |
| no-mock-data-after-integration | PASS | no mock data found in pages after integration | 0ms |
| empty-state-handling | PASS | 10/0 data pages have empty state | 0ms |
| **Score** | **.87** | **2026-05-20T06:07:41Z** | |

**Fix Attempts:** _none_

### test-api — Gate Results

| Check | Result | Detail | Time |
|-------|--------|--------|------|
| smoke-test-pass | FAIL | SMOKE_TEST_STATUS.md not found — smoke test may not have run | 0ms |
| backend-test-files | PASS | count=       9 (expected >= 1) | 0ms |
| backend-tests-pass | PASS |  | 42513ms |
| stability-3x-pass | FAIL | flaky: failed on repeated run | 0ms |
| **Score** | **.50** | **2026-05-20T08:00:52Z** | |

**Fix Attempts:** _none_

### test-browser — Gate Results

| Check | Result | Detail | Time |
|-------|--------|--------|------|
| playwright-config-exists | FAIL | no playwright.config.{ts,mts,js,mjs} found | 0ms |
| specs-exist | FAIL | no tests/e2e/playwright dir found in frontend/ | 0ms |
| no-bad-waits | PASS | no tests dir — skipped (test phase may not have run yet) | 0ms |
| marker-files | FAIL | 0/8 marker files present (need >= 6) | 0ms |
| **Score** | **.25** | **2026-05-20T08:00:52Z** | |

**Fix Attempts:** _none_

### ship — Gate Results

| Check | Result | Detail | Time |
|-------|--------|--------|------|
| _no runs yet_ | | | |

**Fix Attempts:** _none_

## Improvement Queue

Items identified for future iterations.

| Phase | Improvement | Priority | Source | Target Gen |
|-------|-------------|----------|--------|------------|

## Skill Paths by Tier

| Tier | Base Path | Description |
|------|-----------|-------------|
| base | `.claude/skills/` | Generic orchestration (init, ship) |
| $BACKEND | `.claude/$BACKEND/skills/` | Backend skills (prd, database, backend) |
| $FRONTEND | `.claude/$FRONTEND/skills/` + `guides/` | Frontend skills (frontend, dashboard, integrate, qa) |
| $STACK | `.claude/{context}/skills/` | Context-dependent (backend or frontend) |

### Tech Stack Resolution

- `$BACKEND` = tech_stack.backend (e.g., "nestjs", "django")
- `$FRONTEND` = tech_stack.frontends[0] (e.g., "react")
- `$STACK` = Resolved based on phase context

**Supported Tech Stacks:**

| Category | Options | Submodule URL |
|----------|---------|---------------|
| Backend | nestjs, django | github.com/potentialInc/claude-{backend} |
| Frontend | react, react-native | github.com/potentialInc/claude-{frontend} |

## Execution Log

| Date | Phase | Gen | Duration | Result | Score | Notes |
|------|-------|-----|----------|--------|-------|-------|
| 2026-05-19 | init | 1 | 538s | Failed | 0 | fullstack-2 failed:evidence-check |
| 2026-05-19 | init | 1 | - | Complete | .83 | gate-runner |
| 2026-05-19 | init | 1 | 0s | Failed | 0.83 | fullstack-2 failed:gate |
| 2026-05-19 | init | 1 | - | Complete | .83 | gate-runner |
| 2026-05-19 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | prd | 1 | 0s | Failed | 0 | fullstack-2 failed:seed-check |
| 2026-05-19 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | prd | 1 | - | Failed | .66 | gate-runner |
| 2026-05-19 | prd | 1 | 1269s | Failed | 0.66 | fullstack-2 failed:gate |
| 2026-05-19 | prd | 1 | - | Failed | .66 | gate-runner |
| 2026-05-19 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | prd | 1 | 1043s | Complete | 1 | fullstack-2 |
| 2026-05-19 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | design | 1 | 1726s | Failed | 0 | fullstack-2 failed:require-variation-selection |
| 2026-05-19 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | design | 1 | 1987s | Failed | 0 | fullstack-2 failed:design-full-generation |
| 2026-05-19 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | design | 1 | 1924s | Failed | 0 | fullstack-2 failed:design-full-generation |
| 2026-05-19 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | design | 1 | - | Complete | .85 | gate-runner |
| 2026-05-19 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | design | 1 | - | Complete | .85 | gate-runner |
| 2026-05-19 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | design | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | user-stories | 1 | 0s | Failed | 0 | fullstack-2 failed:require-design-approved |
| 2026-05-19 | backend | 1 | 1500s | Failed | 0 | fullstack-2 failed:generate-tests |
| 2026-05-19 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | design | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | user-stories | 1 | - | Failed | .50 | gate-runner |
| 2026-05-19 | user-stories | 1 | 0s | Failed | 0 | fullstack-2 failed:require-html-pages |
| 2026-05-19 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | design | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | user-stories | 1 | 0s | Failed | 0 | fullstack-2 failed:require-html-pages |
| 2026-05-19 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | design | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | user-stories | 1 | 0s | Failed | 0 | fullstack-2 failed:require-html-pages |
| 2026-05-19 | backend | 1 | - | Failed | .77 | gate-runner |
| 2026-05-19 | frontend | 1 | 5058s | Failed | 0 | fullstack-2 failed:typecheck |
| 2026-05-19 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | design | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-19 | user-stories | 1 | 0s | Failed | 0 | fullstack-2 failed:require-html-pages |
| 2026-05-19 | integrate | 1 | 2671s | Failed | 0 | fullstack-2 failed:evidence-check |
| 2026-05-19 | integrate | 1 | 2140s | Failed | 0 | fullstack-2 failed:evidence-check |
| 2026-05-19 | test-api | 1 | 206s | Failed | 0 | fullstack-2 failed:smoke-test |
| 2026-05-20 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | design | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | user-stories | 1 | 0s | Failed | 0 | fullstack-2 failed:require-html-pages |
| 2026-05-20 | backend | 1 | - | Failed | .70 | gate-runner |
| 2026-05-20 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | design | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | user-stories | 1 | - | Failed | .66 | gate-runner |
| 2026-05-20 | user-stories | 1 | 591s | Failed | 0.66 | fullstack-2 failed:gate |
| 2026-05-20 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | design | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | user-stories | 1 | - | Failed | .66 | gate-runner |
| 2026-05-20 | user-stories | 1 | 199s | Failed | 0.66 | fullstack-2 failed:gate |
| 2026-05-20 | user-stories | 1 | - | Failed | .66 | gate-runner |
| 2026-05-20 | integrate | 1 | 2150s | Failed | 0 | fullstack-2 failed:evidence-check |
| 2026-05-20 | test-api | 1 | 66s | Failed | 0 | fullstack-2 failed:smoke-test |
| 2026-05-20 | test-browser | 1 | 116s | Failed | 0 | fullstack-2 failed:story-runner |
| 2026-05-20 | user-stories | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | backend | 1 | - | Failed | .73 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Failed | .72 | gate-runner |
| 2026-05-20 | integrate | 1 | - | Complete | .87 | gate-runner |
| 2026-05-20 | integrate | 1 | - | Complete | .87 | gate-runner |
| 2026-05-20 | integrate | 1 | - | Complete | .93 | gate-runner |
| 2026-05-20 | integrate | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | backend | 1 | - | Complete | .85 | gate-runner |
| 2026-05-20 | backend | 1 | - | Complete | .88 | gate-runner |
| 2026-05-20 | backend | 1 | - | Complete | .88 | gate-runner |
| 2026-05-20 | backend | 1 | - | Complete | .94 | gate-runner |
| 2026-05-20 | backend | 1 | - | Complete | .94 | gate-runner |
| 2026-05-20 | backend | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | design | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | user-stories | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | backend | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Failed | .68 | gate-runner |
| 2026-05-20 | integrate | 1 | - | Complete | .88 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Failed | .68 | gate-runner |
| 2026-05-20 | integrate | 1 | - | Complete | .88 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Failed | .68 | gate-runner |
| 2026-05-20 | integrate | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Failed | .68 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Failed | .68 | gate-runner |
| 2026-05-20 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | design | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | user-stories | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | backend | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Failed | .68 | gate-runner |
| 2026-05-20 | integrate | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | test-api | 1 | - | Failed | .50 | gate-runner |
| 2026-05-20 | test-browser | 1 | - | Failed | .25 | gate-runner |
| 2026-05-20 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | design | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | user-stories | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | backend | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Failed | .68 | gate-runner |
| 2026-05-20 | integrate | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | test-api | 1 | - | Failed | .50 | gate-runner |
| 2026-05-20 | test-browser | 1 | - | Failed | .25 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Failed | .68 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Failed | .75 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Failed | .75 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Failed | .79 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Complete | .86 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Complete | .86 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Complete | .86 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Complete | .86 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Complete | .86 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Complete | .89 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Complete | .89 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Complete | .93 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Complete | .93 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Complete | .93 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Complete | .93 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Complete | .96 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | design | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | user-stories | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | backend | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | integrate | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | test-api | 1 | - | Failed | .50 | gate-runner |
| 2026-05-20 | test-browser | 1 | - | Failed | .25 | gate-runner |
| 2026-05-20 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | design | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | user-stories | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | backend | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | frontend | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-20 | integrate | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | design | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | user-stories | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | backend | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | frontend | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | integrate | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | test-api | 1 | - | Failed | .50 | gate-runner |
| 2026-05-21 | test-browser | 1 | - | Failed | .25 | gate-runner |
| 2026-05-21 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | design | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | user-stories | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | backend | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | frontend | 1 | - | Complete | .89 | gate-runner |
| 2026-05-21 | integrate | 1 | - | Complete | .94 | gate-runner |
| 2026-05-21 | test-api | 1 | - | Failed | .50 | gate-runner |
| 2026-05-21 | test-browser | 1 | - | Failed | .25 | gate-runner |
| 2026-05-21 | frontend | 1 | - | Complete | .89 | gate-runner |
| 2026-05-21 | integrate | 1 | - | Complete | .94 | gate-runner |
| 2026-05-21 | frontend | 1 | - | Complete | .93 | gate-runner |
| 2026-05-21 | frontend | 1 | - | Complete | .93 | gate-runner |
| 2026-05-21 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | design | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | user-stories | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | backend | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | frontend | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | integrate | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | test-api | 1 | - | Failed | .50 | gate-runner |
| 2026-05-21 | test-browser | 1 | - | Failed | .25 | gate-runner |
| 2026-05-21 | init | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | prd | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | design | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | database | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | user-stories | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | backend | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | frontend | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | integrate | 1 | - | Complete | 1.00 | gate-runner |
| 2026-05-21 | test-browser | 1 | 2701s | Failed | 0 | fullstack-2 failed:story-runner |

## Phase Details

### spec
- **Status**: Pending
- **Seed**: -
- **Ambiguity**: -

### init
- **Status**: Pending
- **Output**: -

### prd
- **Status**: Pending
- **PRD**: -
- **Converted Docs**: -

---

## Status Labels

| Label | Meaning |
|-------|---------|
| Complete | Phase finished successfully |
| In Progress | Currently executing |
| Pending | Not yet started |
| Failed | Execution failed |
| Needs Review | Artifact invalidated, re-evaluation needed |
| Skipped | Carried from previous generation |
