// Accounts: passwords are stored only as salted SHA-256 hashes.
const SEED_ACCOUNTS=[
 {
  "u": "chief.l3elta",
  "role": "chief",
  "name": "Class chief \u2013 L3 ELT A",
  "salt": "0a47ec0dac2a",
  "h": "be54406b8501b6492e8fe9fabb800e894e59e1a6c9b9056de06a2bdf3f0d2a2b",
  "cls": "L3 ELT A"
 },
 {
  "u": "chief.l3eltb",
  "role": "chief",
  "name": "Class chief \u2013 L3 ELT B",
  "salt": "7d18239f88fa",
  "h": "5b5d8bb2408156d9570690fc8826e0de335b43def5aae29c88c0cdefd51c4078",
  "cls": "L3 ELT B"
 },
 {
  "u": "chief.l3soda",
  "role": "chief",
  "name": "Class chief \u2013 L3 SOD A",
  "salt": "17a53def745a",
  "h": "8938634b5b7c46f6db23325d9e28168d6e8229713e0cc1c606ab39a56af2a2c9",
  "cls": "L3 SOD A"
 },
 {
  "u": "chief.l3sodb",
  "role": "chief",
  "name": "Class chief \u2013 L3 SOD B",
  "salt": "243bd68ce7b7",
  "h": "7a90812c34b96b2fa8a5ca7ffd8ff5f7053cc5584f5b49c67b0b27eb09986066",
  "cls": "L3 SOD B"
 },
 {
  "u": "chief.l3sodc",
  "role": "chief",
  "name": "Class chief \u2013 L3 SOD C",
  "salt": "487276ae868f",
  "h": "783b287171298982c147b7de9dbf17b9c4f84aab4003daa572861eda808f6daa",
  "cls": "L3 SOD C"
 },
 {
  "u": "chief.l4elt",
  "role": "chief",
  "name": "Class chief \u2013 L4 ELT",
  "salt": "5a2f071b5a46",
  "h": "2209ff19b5c7c3a017e223af94fbc3e21b88ca36232c2efb7f00f80414656bd4",
  "cls": "L4 ELT"
 },
 {
  "u": "chief.l4soda",
  "role": "chief",
  "name": "Class chief \u2013 L4 SOD A",
  "salt": "e46a4b079873",
  "h": "007fb91fddd6ec88feb15a1c974cbe2dd31a3bbc259023aaabe4f8e708f7eff3",
  "cls": "L4 SOD A"
 },
 {
  "u": "chief.l4sodb",
  "role": "chief",
  "name": "Class chief \u2013 L4 SOD B",
  "salt": "dea8893c4707",
  "h": "512065f5a140e9aca647737840053638bba6eca61a79f7ca165504067bbb645d",
  "cls": "L4 SOD B"
 },
 {
  "u": "chief.l5elt",
  "role": "chief",
  "name": "Class chief \u2013 L5 ELT",
  "salt": "20b2f0c43ca1",
  "h": "713f75591c3aafcb6a7c3eec15565aab397f5b242f9c69fbb9089b22bc69cbf7",
  "cls": "L5 ELT"
 },
 {
  "u": "chief.l5soda",
  "role": "chief",
  "name": "Class chief \u2013 L5 SOD A",
  "salt": "090c5414da0f",
  "h": "e06e0a4b7697a38d6e77d1c90df0e8b45c52f734f9ed30c112ac5dc8c4f15166",
  "cls": "L5 SOD A"
 },
 {
  "u": "chief.l5sodb",
  "role": "chief",
  "name": "Class chief \u2013 L5 SOD B",
  "salt": "8214619dd57b",
  "h": "1a913ee8885f6fed9e5c1e0e0d1c8be87302e8969e7686eb77ab9d81e608db63",
  "cls": "L5 SOD B"
 },
 {
  "u": "teacher01",
  "role": "teacher",
  "name": "Teacher 01",
  "salt": "7080accf6f3b",
  "h": "68a15fc3639fb500bbf36960cf10e0b731bad6c618c7001920361d00a1958d14"
 },
 {
  "u": "teacher02",
  "role": "teacher",
  "name": "Teacher 02",
  "salt": "9524226b8d95",
  "h": "cd0e0daa401b27e6e1b3d34497575d4836eb590d99e0556241e32a4fcc84cd20"
 },
 {
  "u": "teacher03",
  "role": "teacher",
  "name": "Teacher 03",
  "salt": "eae0b6d9534a",
  "h": "22063e3a4425cd81ef20a8958f7c2d04f4332281f79853ecdea7144d6a8c0064"
 },
 {
  "u": "teacher04",
  "role": "teacher",
  "name": "Teacher 04",
  "salt": "305ef5dde9f9",
  "h": "03e2dc7412c630332e4113b400f829faeeba7053b7f7d8e8239b7ddc85dbe0d7"
 },
 {
  "u": "teacher05",
  "role": "teacher",
  "name": "Teacher 05",
  "salt": "169a66ddd99c",
  "h": "dce8b2103f335d363d116fcd0156553f0815cf7c52ac3f3c282f98e5f6c338b7"
 },
 {
  "u": "teacher06",
  "role": "teacher",
  "name": "Teacher 06",
  "salt": "dbaec119330c",
  "h": "f5bf1c129b918c5a147392f148227840358383c8c8169632ad54fb3624c25385"
 },
 {
  "u": "teacher07",
  "role": "teacher",
  "name": "Teacher 07",
  "salt": "beb0ac3b22cc",
  "h": "a691fc47bb37acfffdaf44f4cdfa1007de2497d5b921f5c3b7b5304cac393fd1"
 },
 {
  "u": "teacher08",
  "role": "teacher",
  "name": "Teacher 08",
  "salt": "008399beda61",
  "h": "c3eba10d4bfed81718e29ef3f05a2ed614a6de86aceb742c4ebaf1e52ee79d3b"
 },
 {
  "u": "teacher09",
  "role": "teacher",
  "name": "Teacher 09",
  "salt": "cf00898b6a57",
  "h": "e691110088a9b8b0991b76fdc66463cbd6c9c3b9eedfaa38767212d92803f605"
 },
 {
  "u": "teacher10",
  "role": "teacher",
  "name": "Teacher 10",
  "salt": "e7301375da89",
  "h": "0c8894138f55d4902d61cde5af4278b9c7c45b257d94f7a0e1e2244e46f4e770"
 }
];
