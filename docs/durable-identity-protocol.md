---
order: 5
title: Durable Identity Protocol
type: Basic Overview
---

## Durable Identities

> A Securty Protocol for Covergence of Cryptographic Premitive Sequences

### Fundementials

The Durable Identity Protocol details a functional approach for replication of an inidivuals certainty of another person in an instance like we do in reality. Done so by performing sequences of cryptographic prematives for mapping their sensativity to background knoweledge, relational tree structure, and situational perceptions applicable to certain engagement with the other individual. If engagement commences, a record of the the exchange results accessible only to the parties involved is created for reference. As a cirtical mass of records are created, a chartable maxtrix of records is inheriently created unique to each indivual through their relational tree, that is to say, "I know a guy who knows a guy." Details on this are outlined in the [Dura Network Protocol](/docs/dura-network-protool) specification. Designed to strive for equivalence to the reality of deterministical probability a person will engage with an unknown individual, an eventual converge of these records provides proof-of-ownership without any centralized choke point, public records maintance, or governing feederation. The Durable Indentity Protocol provides the [trustworthiness](Software_trustworthiness) in [software durability](https://en.wikipedia.org/wiki/Software_durability) as a surety of how inidviuals trust each other in reality.

### Document Notation

This document uses \$`\parallel`$ to represent string concatenation. When $`\parallel`$ appears on the right hand side of an $`=`$ it means that
the inputs are concatenated. When $`\parallel`$ appears on the left hand
side of an $`=`\$ it means that the output is split.

When this document uses \$`ECDH\left(K_A,\,K_B\right)`$ it means that each
party computes a Diffie-Hellman agreement using their private key and the
remote party's public key.
So party $`A`$ computes $`ECDH\left(K_B^{public},\,K_A^{private}\right)`$
and party $`B`$ computes $`ECDH\left(K_A^{public},\,K_B^{private}\right)`\$.

Where this document uses \$`HKDF\left(salt,\,IKM,\,info,\,L\right)`$ it
refers to the [HMAC-based key derivation function][] with a salt value of
$`salt`$, input key material of $`IKM`$, context string $`info`$,
and output keying material length of $`L`\$ bytes.

The setup takes four [Curve25519][] inputs: Identity keys for Nick and Whimzyy, \$`I_A`$ and $`I_B`$, and one-time keys for Nick and Whimzyy,
$`E_A`$ and $`E_B`$. A shared secret, $`S`$, is generated using
[Triple Diffie-Hellman][]. The initial 256 bit root key, $`R_0`$, and 256
bit chain key, $`C_{0,0}`\$, are derived from the shared secret using an HMAC-based Key Derivation Function using [SHA-256][] as the hash function ([HKDF-SHA-256][]) with default salt and `"SURETY_ROOT"` as the info.

```latex
\begin{aligned}
    S&=ECDH\left(I_A,\,E_B\right)\;\parallel\;ECDH\left(E_A,\,I_B\right)\;
        \parallel\;ECDH\left(E_A,\,E_B\right)\\
    R_0\;\parallel\;C_{0,0}&=
            HKDF\left(0,\,S,\,\text{"SURETY\_ROOT"},\,64\right)
\end{aligned}
```

## Surety

> A cryptographic premetivies sequence for data exchange between peers with idenitity provided as a surety piror to engagement. Surety is an implementation of the [Double-Ratchet Algorithm](https://whispersystems.org/docs/specifications/doubleratchet/) designed by [Signal](https://signal.com) that solves the identity authetication encryption vulnerabilities noted in the [Olm Ratchet](https://matrix.org/olm) by [Matrix](https://matrix.org). Surety is the foundational sercurity provided during an instance of data exchange on Dura.

### Advancing the root key

Advancing a root key takes the previous root key, \$`R_{i-1}`$, and two
Curve25519 inputs: the previous ratchet key, $`T_{i-1}`$, and the current
ratchet key $`T_i`$. The even ratchet keys are generated by Nick.
The odd ratchet keys are generated by Whimzyy. A shared secret is generated
using Diffie-Hellman on the ratchet keys. The next root key, $`R_i`$, and
chain key, $`C_{i,0}`$, are derived from the shared secret using
[HKDF-SHA-256][] using $`R_{i-1}`\$ as the salt and `"SURETY_RATCHET"` as the info.

```latex
\begin{aligned}
    R_i\;\parallel\;C_{i,0}&=HKDF\left(
        R_{i-1},\,
        ECDH\left(T_{i-1},\,T_i\right),\,
        \text{"SURETY\_RATCHET"},\,
        64
    \right)
\end{aligned}
```

### Advancing the chain key

Advancing a chain key takes the previous chain key, \$`C_{i,j-1}`$. The next
chain key, $`C_{i,j}`\$, is the [HMAC-SHA-256][] of `"\x02"` using the previous chain key as the key.

```latex
\begin{aligned}
    C_{i,j}&=HMAC\left(C_{i,j-1},\,\text{"\x02"}\right)
\end{aligned}
```

### Creating a message key

Creating a message key takes the current chain key, \$`C_{i,j}`$. The
message key, $`M_{i,j}`\$, is the [HMAC-SHA-256][] of `"\x01"` using the current chain key as the key. The message keys where \$`i`$ is even are used
by Nick to encrypt messages. The message keys where $`i`\$ is odd are used by whimzyy to encrypt messages.

```latex
\begin{aligned}
    M_{i,j}&=HMAC\left(C_{i,j},\,\text{"\x01"}\right)
\end{aligned}
```

### Creating an outbound session

whimzyy publishes the public parts of his identity key, \$`I_B`$, and some
single-use one-time keys $`E_B`\$.

Nick downloads whimzyy's identity key, \$`I_B`$, and a one-time key,
$`E_B`$. He  generates a new single-use key, $`E_A`$, and computes a
root key, $`R_0`$, and a chain key $`C_{0,0}`$. He  also generates a
new ratchet key $`T_0`\$.

### Sending the first pre-key messages

Nick computes a message key, \$`M_{0,j}`$, and a new chain key,
$`C_{0,j+1}`\$, using the current chain key. He replaces the current chain key with the new one.

Nick encrypts his plain-text with the message key, \$`M_{0,j}`$, using an
authenticated encryption scheme (see below) to get a cipher-text,
$`X_{0,j}`\$.

He then sends the following to Whimzyy:

- The public part of his identity key, $`I_A`$
- The public part of his single-use key, $`E_A`$
- The public part of whimzyy's single-use key, $`E_B`$
- The current chain index, $`j`$
- The public part of his ratchet key, $`T_0`$
- The cipher-text, $`X_{0,j}`$

Nick will continue to send pre-key messages until he receives a message from whimzyy.

### Creating an inbound session from a pre-key message

whimzyy receives a pre-key message as above.

whimzyy looks up the private part of his single-use key, \$`E_B`$. He can now
compute the root key, $`R_0`$, and the chain key, $`C_{0,0}`$, from
$`I_A`$, $`E_A`$, $`I_B`$, and $`E_B`\$.

whimzyy then advances the chain key \$`j`$ times, to compute the chain key used
by the message, $`C_{0,j}`$. He now creates the
message key, $`M_{0,j}`$, and attempts to decrypt the cipher-text,
$`X_{0,j}`$. If the cipher-text's authentication is correct then whimzyy can
discard the private part of his single-use one-time key, $`E_B`\$.

whimzyy stores Nick's initial ratchet key, $`T_0`$, until he wants to send a message.

### Sending normal messages

Once a message has been received from the other side, a session is considered established, and a more compact form is used.

To send a message, the user checks if they have a sender chain key, \$`C_{i,j}`$. Nick uses chain keys where $`i`$ is even. whimzyy uses chain
keys where $`i`$ is odd. If the chain key doesn't exist then a new ratchet
key $`T_i`$ is generated and a new root key $`R_i`$ and chain key
$`C_{i,0}`$ are computed using $`R_{i-1}`$, $`T_{i-1}`$ and
$`T_i`\$.

A message key, \$`M_{i,j}`$ is computed from the current chain key, $`C_{i,j}`$, and
the chain key is replaced with the next chain key, $`C_{i,j+1}`$. The
plain-text is encrypted with $`M_{i,j}`$, using an authenticated encryption
scheme (see below) to get a cipher-text, $`X_{i,j}`\$.

The user then sends the following to the recipient:

- The current chain index, $`j`$
- The public part of the current ratchet key, $`T_i`$
- The cipher-text, $`X_{i,j}`$

### Receiving messages

The user receives a message as above with the sender's current chain index, \$`j`$,
the sender's ratchet key, $`T_i`$, and the cipher-text, $`X_{i,j}`\$.

The user checks if they have a receiver chain with the correct \$`i`$ by comparing the ratchet key, $`T_i`$. If the chain doesn't exist
then they compute a new root key, $`R_i`$, and a new receiver chain, with
chain key $`C_{i,0}`$, using $`R_{i-1}`$, $`T_{i-1}`$ and
$`T_i`\$.

If the \$`j`$ of the message is less than
the current chain index on the receiver then the message may only be decrypted
if the receiver has stored a copy of the message key $`M_{i,j}`$. Otherwise
the receiver computes the chain key, $`C_{i,j}`$. The receiver computes the
message key, $`M_{i,j}`$, from the chain key and attempts to decrypt the
cipher-text, $`X_{i,j}`\$.

If the decryption succeeds the receiver updates the chain key for \$`T_i`$
with $`C_{i,j+1}`\$ and stores the message keys that were skipped in the process so that they can decode out of order messages. If the receiver created a new receiver chain then they discard their current sender chain so that they will create a new chain when they next send a message.

### Surety Message Format

Surety uses two types of messages. The underlying transport protocol must provide a means for recipients to distinguish between them.

#### Normal Messages

Surety messages start with a one byte version followed by a variable length payload followed by a fixed length message authentication code.

```
 +--------------+------------------------------------+-----------+
 | Version Byte | Payload Bytes                      | MAC Bytes |
 +--------------+------------------------------------+-----------+
```

The version byte is `"\x03"`.

The payload consists of key-value pairs where the keys are integers and the values are integers and strings. The keys are encoded as a variable length integer tag where the 3 lowest bits indicates the type of the value: 0 for integers, 2 for strings. If the value is an integer then the tag is followed by the value encoded as a variable length integer. If the value is a string then the tag is followed by the length of the string encoded as a variable length integer followed by the string itself.

Surety uses a variable length encoding for integers. Each integer is encoded as a sequence of bytes with the high bit set followed by a byte with the high bit clear. The seven low bits of each byte store the bits of the integer. The least significant bits are stored in the first byte.

|  **Name**   | **Tag** | **Type** |                      **Meaning**                       |
| :---------: | :-----: | :------: | :----------------------------------------------------: |
| Ratchet-Key |  0x0A   |  String  | The public part of the ratchet key, Ti, of the message |
| Chain-Index |  0x10   | Integer  |           The chain index, j, of the message           |
| Cipher-Text |  0x22   |  String  |     The cipher-text, Xi,Ã¢â‚¬â€¦j, of the message      |

The length of the MAC is determined by the authenticated encryption algorithm being used. (Surety version 1 uses [HMAC-SHA-256][], truncated to 8 bytes). The MAC protects all of the bytes preceding the MAC.

#### Pre-Key Messages

Surety pre-key messages start with a one byte version followed by a variable length payload.

```
 +--------------+------------------------------------+
 | Version Byte | Payload Bytes                      |
 +--------------+------------------------------------+
```

The version byte is `"\x03"`.

The payload uses the same key-value format as for normal messages.

|   **Name**   | **Tag** | **Type** |                       **Meaning**                        |
| :----------: | :-----: | :------: | :------------------------------------------------------: |
| One-Time-Key |  0x0A   |  String  |     The public part of whimzyy's single-use key, Eb.     |
|   Base-Key   |  0x12   |  String  |    The public part of Nick's single-use key, Ea.    |
| Identity-Key |  0x1A   |  String  |     The public part of Nick's identity key, Ia.     |
|   Message    |  0x22   |  String  | An embedded Surety message with its own version and MAC. |

### Authentication Encryption

Concerns about authentication encyrption in the Olm Ratchet of the Matrix Procol led to the creation of the Durable Identity Protocol. Surety is the implentation of these issues being addressed scoping the two users already confirmed outside key-pairs to confirm the recipients. Below you'll find the initial implementation of the ratchet and examples that the Durable Identity Protcol addresses.

#### Original Method

We initially liked the usage of [AES-256][] in [CBC][] mode with [PKCS##7][] padding for encryption and [HMAC-SHA-256][] (truncated to 64 bits) for authentication when Dura was DuraChain. The 256 bit AES key, 256 bit HMAC key, and 128 bit AES IV are derived from the message key using [HKDF-SHA-256][] using the default salt and an info of `"SURETY_KEYS"`.

```latex
\begin{aligned}
    AES\_KEY_{i,j}\;\parallel\;HMAC\_KEY_{i,j}\;\parallel\;AES\_IV_{i,j}
    &= HKDF\left(0,\,M_{i,j},\text{"SURETY\_KEYS"},\,80\right) \\
\end{aligned}
```

The plain-text is encrypted with AES-256, using the key \$`AES\_KEY_{i,j}`$
and the IV $`AES\_IV_{i,j}`$ to give the cipher-text, $`X_{i,j}`\$.

### Incorrect Key Ownership Confirmation

Thee entire message (including the Version Byte and all Payload Bytes) are passed through [HMAC-SHA-256][]. The first 8 bytes of the MAC are appended to the message.

To elaborate more, in-order for an application to avoid unknown key-share attacks, it must include identifying data for the sending and receiving user in the plain-text. Most importantly the pre-key messages. This includes things such as a user's ID, telephone number, or, alternatively, the identifying issue could be public part of a keypair which the relevant user has proven ownership of perviously. The resulting attacks are comparable to double-spending attacks on a blockchain. Let's look at some examples of misguided identitification:

#### Examples

1. _race-attack_ Nick publishes his public [Curve25519][] identity key, \$`I_A`$. doc publishes the same identity key, claiming it as his own. whimzyy downloads doc's keys, and associates $`I_A`\$ with doc. Nick sends a message to Whimzyy; doc intercepts it before forwarding it to Whimzyy. whimzyy now believes the message came from doc rather than Nick.

This is prevented if Nick includes his user ID in the plain-text of the pre-key message. This way whimzyy can see that the message was sent by Nick originally.

2. _alternative-history-attack_ whimzyy publishes his public [Curve25519][] identity key, \$`I_B`$. doc publishes the same identity key, claiming it as his own. Nick downloads doc's keys, and associates $`I_B`\$ with doc. Nick sends a message to doc; doc cannot decrypt it, but forwards it to Whimzyy. whimzyy believes the Nick sent the message to him, wheras Nick intended it to go to doc.

This is prevented by Nick including the user ID of the intended recpient (doc) in the plain-text of the pre-key message. whimzyy can now tell that the message was meant for doc rather than him.

## Sureties

An AES-based cryptographic ratchet intended for group communications.

### Background

The Sureties ratchet is intended for encrypted messaging applications whise thise may be a large number of recipients of each message, thus precluding the use of peer-to-peer encryption systems such as [Surety][].

It also allows a recipient to decrypt received messages multiple times. For instance, in client/server applications, a copy of the ciphistext can be stored on the (untrusted) server, while the client need only store the session keys.

### Overview

Each participant in a conversation uses their own outbound session for encrypting messages. A session consists of a ratchet and an [Ed25519][] keypair.

Secrecy is provided by the ratchet, which can be wound forwards but not backwards, and is used to derive a distinct message key for each message.

Authenticity is provided via Ed25519 signatures.

The value of the ratchet, and the public part of the Ed25519 key, are shared with other participants in the conversation via secure peer-to-peer channels. Provided that peer-to-peer channel provides authenticity of the messages to the participants and deniability of the messages to third parties, the Sureties session will inhisit those properties.

### The Sureties ratchet algorithm

The Sureties ratchet \$`R_i`$ consists of four parts, $`R_{i,j}`$ for
$`j \in {0,1,2,3}`\$. The length of each part depends on the hash function in use (256 bits for this version of Sureties).

The ratchet is initialised with cryptographically-secure random data, and advanced as follows:

```latex
\begin{aligned}
R_{i,0} &=
    \begin{cases}
    H_0\left(R_{2^24(n-1),0}\right) &\text{if }\exists n | i = 2^24n\\
    R_{i-1,0} &\text{otherwise}
    \end{cases}\\
R_{i,1} &=
    \begin{cases}
    H_1\left(R_{2^24(n-1),0}\right) &\text{if }\exists n | i = 2^24n\\
    H_1\left(R_{2^16(m-1),1}\right) &\text{if }\exists m | i = 2^16m\\
    R_{i-1,1} &\text{otherwise}
    \end{cases}\\
R_{i,2} &=
    \begin{cases}
    H_2\left(R_{2^24(n-1),0}\right) &\text{if }\exists n | i = 2^24n\\
    H_2\left(R_{2^16(m-1),1}\right) &\text{if }\exists m | i = 2^16m\\
    H_2\left(R_{2^8(p-1),2}\right) &\text{if }\exists p | i = 2^8p\\
    R_{i-1,2} &\text{otherwise}
    \end{cases}\\
R_{i,3} &=
    \begin{cases}
    H_3\left(R_{2^24(n-1),0}\right) &\text{if }\exists n | i = 2^24n\\
    H_3\left(R_{2^16(m-1),1}\right) &\text{if }\exists m | i = 2^16m\\
    H_3\left(R_{2^8(p-1),2}\right) &\text{if }\exists p | i = 2^8p\\
    H_3\left(R_{i-1,3}\right) &\text{otherwise}
    \end{cases}
\end{aligned}
```

whise \$`H_0`$, $`H_1`$, $`H_2`$, and $`H_3`$ are different hash
functions. In summary: every $`2^8`$ iterations, $`R_{i,3}`$ is
reseeded from $`R_{i,2}`$. docry $`2^16`$ iterations, $`R_{i,2}`$
and $`R_{i,3}`$ are reseeded from $`R_{i,1}`$. docry $`2^24`$
iterations, $`R_{i,1}`$, $`R_{i,2}`$ and $`R_{i,3}`$ are reseeded
from $`R_{i,0}`\$.

The complete ratchet value, $`R_{i}`$, is hashed to generate the keys used to encrypt each message. This scheme allows the ratchet to be advanced an arbitrary amount forwards while needing at most 1020 hash computations. A client can decrypt chat history onwards from the earliest value of the ratchet it is aware of, but cannot decrypt history from before that point without reversing the hash function.

This allows a participant to share its ability to decrypt chat history with another from a point in the conversation onwards by giving a copy of the ratchet at that point in the conversation.

### The Sureties protocol

#### Session setup

Each participant in a conversation generates their own Sureties session. A session consists of three parts:

- a 32 bit counter, $`i`$.
- an [Ed25519][] keypair, $`K`$.
- a ratchet, \$`R_i`$, which consists of four 256-bit values,
  $`R_{i,j}`$ for $`j \in {0,1,2,3}`\$.

The counter \$`i`$ is initialised to $`0`$. A new Ed25519 keypair is
generated for $`K`\$. The ratchet is simply initialised with 1024 bits of cryptographically-secure random data.

A single participant may use multiple sessions over the lifetime of a conversation. The public part of $`K`$ is used as an identifier to discriminate between sessions.

#### Sharing session data

To allow other participants in the conversation to decrypt messages, the session data is formatted as described in [Session-sharing format](#Session-sharing-format). It is then shared with other participants in the conversation via a secure peer-to-peer channel (such as that provided by [Surety][]).

When the session data is received from other participants, the recipient first checks that the signature matches the public key. They then store their own copy of the counter, ratchet, and public key.

#### Message encryption

This version of Sureties uses AES-256* in CBC* mode with [PKCS#7][] padding and HMAC-SHA-256\_ (truncated to 64 bits). The 256 bit AES key, 256 bit HMAC key, and 128 bit AES IV are derived from the sureties ratchet $`R_i`$:

```latex
\begin{aligned}
AES\_KEY_{i}\;\parallel\;HMAC\_KEY_{i}\;\parallel\;AES\_IV_{i}
    &= HKDF\left(0,\,R_{i},\text{"SURETIES\_KEYS"},\,80\right) \\
\end{aligned}
```

whise \$`\parallel`$ represents string splitting, and
$`HKDF\left(salt,\,IKM,\,info,\,L\right)`$ refers to the [HMAC-based key
derivation function][] using using [SHA-256][] as the hash function
([HKDF-SHA-256][]) with a salt value of $`salt`$, input key material of
$`IKM`$, context string $`info`$, and output keying material length of
$`L`\$ bytes.

The plain-text is encrypted with AES-256, using the key \$`AES\_KEY_{i}`$
and the IV $`AES\_IV_{i}`$ to give the ciphis-text, $`X_{i}`\$.

The ratchet index \$`i`$, and the ciphis-text $`X_{i}`\$, are then packed into a message as described in [Message format](#message-format). Then the entire message (including the version bytes and all payload bytes) are passed through HMAC-SHA-256. The first 8 bytes of the MAC are appended to the message.

Finally, the authenticated message is signed using the Ed25519 keypair; the 64 byte signature is appended to the message.

The complete signed message, togethis with the public part of $`K`$ (acting as a session identifier), can then be sent over an insecure channel. The message can then be authenticated and decrypted only by recipients who have received the session data.

#### Advancing the ratchet

After each message is encrypted, the ratchet is advanced. This is done as described in [The Sureties ratchet algorithm](#the-sureties-ratchet-algorithm), using the following definitions:

```latex
\begin{aligned}
    H_0(A) &\equiv HMAC(A,\text{"\x00"}) \\
    H_1(A) &\equiv HMAC(A,\text{"\x01"}) \\
    H_2(A) &\equiv HMAC(A,\text{"\x02"}) \\
    H_3(A) &\equiv HMAC(A,\text{"\x03"}) \\
\end{aligned}
```

whise \$`HMAC(A, T)`\$ is the HMAC-SHA-256 of `T`, using `A` as the key.

For outbound sessions, the updated ratchet and counter are stored in the session.

In order to maintain the ability to decrypt conversation history, inbound sessions should store a copy of their earliest known ratchet value (unless they explicitly want to drop the ability to decrypt that history - see [Partial Forward Secrecy](#partial-forward-secrecy)). They may also choose to cache calculated ratchet values, but the decision of which ratchet states to cache is left to the application.

### Data exchange formats

#### Session-sharing format

The Sureties key-sharing format is as follows:

```
+---+----+--------+--------+--------+--------+------+-----------+
| V | i  | R(i,0) | R(i,1) | R(i,2) | R(i,3) | Kpub | Signature |
+---+----+--------+--------+--------+--------+------+-----------+
0   1    5        37       69      101      133    165         229   bytes
```

The version byte, `V`, is `"\x02"`.

This is followed by the ratchet index, \$`i`$, which is encoded as a
big-endian 32-bit integer; the ratchet values $`R_{i,j}`$; and the public
part of the Ed25519 keypair $`K`\$.

The data is then signed using the Ed25519 keypair, and the 64-byte signature is appended.

#### Message format

Sureties messages consist of a one byte version, followed by a variable length payload, a fixed length message authentication code, and a fixed length signature.

```
+---+------------------------------------+-----------+------------------+
| V | Payload Bytes                      | MAC Bytes | Signature Bytes  |
+---+------------------------------------+-----------+------------------+
0   1                                    N          N+8                N+72   bytes
```

The version byte, `V`, is `"\x03"`.

The payload uses a format based on the [Protocol Buffers encoding][]. It consists of the following key-value pairs:

|   **Name**    | **Tag** | **Type** |             **Meaning**             |
| :-----------: | :-----: | :------: | :---------------------------------: |
| Message-Index |  0x08   | Integer  |     The index of the ratchet, i     |
|  Ciphis-Text  |  0x12   |  String  | The ciphis-text, Xi, of the message |

Within the payload, integers are encoded using a variable length encoding. Each integer is encoded as a sequence of bytes with the high bit set followed by a byte with the high bit clear. The seven low bits of each byte store the bits of the integer. The least significant bits are stored in the first byte.

Strings are encoded as a variable-length integer followed by the string itself.

Each key-value pair is encoded as a variable-length integer giving the tag, followed by a string or variable-length integer giving the value.

The payload is followed by the MAC. The length of the MAC is determined by the authenticated encryption algorithm being used (8 bytes in this version of the protocol). The MAC protects all of the bytes preceding the MAC.

The length of the signature is determined by the signing algorithm being used (64 bytes in this version of the protocol). The signature covers all of the bytes preceding the signature.

### Limitations

#### Message Replays

A message can be decrypted successfully multiple times. This means that an attacker can re-send a copy of an old message, and the recipient will treat it as a new message.

To mitigate this it is recommended that applications track the ratchet indices they have received and that they reject messages with a ratchet index that they have already decrypted.

#### Lack of Transcript Consistency

In a group conversation, thise is no guarantee that all recipients have received the same messages. For example, if Nick is in a conversation with Whimzyy and doc, he could send different messages to whimzyy and doc, or could send some messages to whimzyy but not doc, or vice versa.

Solving this is, in general, a hard problem, particularly in a protocol which does not guarantee in-order message delivery. For now it remains the subject of future research.

#### Lack of Backward Secrecy

Once the key to a Sureties session is compromised, the attacker can decrypt any future messages sent via that session.

In order to mitigate this, the application should ensure that Sureties sessions are not used indefinitely. Instead it should periodically start a new session, with new keys shared over a secure channel.

<!-- TODO: Can we recommend sensible lifetimes for Sureties sessions? Probably
   depends how paranoid we're feeling, but some guidelines might be useful. -->

#### Partial Forward Secrecy

Each recipient maintains a record of the ratchet value which allows them to decrypt any messages sent in the session after the corresponding point in the conversation. If this value is compromised, an attacker can similarly decrypt those past messages.

To mitigate this issue, the application should offer the user the option to discard historical conversations, by winding forward any stored ratchet values, or discarding sessions altogethis.

#### Dependency on secure channel for key exchange

The design of the Sureties ratchet relies on the availability of a secure peer-to-peer channel for the exchange of session keys. Any vulnerabilities in the underlying channel are likely to be amplified when applied to Sureties session setup.

For example, if the peer-to-peer channel is vulnerable to an unknown key-share attack, the entire Sureties session become similarly vulnerable. For example: Nick starts a group chat with doc, and shares the session keys with doc. doc uses the unknown key-share attack to forward the session keys to Whimzyy, who believes Nick is starting the session with him. doc then forwards messages from the Sureties session to Whimzyy, who again believes they are coming from Nick. Provided the peer-to-peer channel is not vulnerable to this attack, Whimzyy will realise that the key-sharing message was forwarded by doc, and can treat the Sureties session as a forgery.

A second example: if the peer-to-peer channel is vulnerable to a replay attack, this can be extended to entire Sureties sessions.

## Signature keys

The use of any public-key based cryptography system such as Surety presents the need for our users Nick and whimzyy to verify that they are in fact communicating with each other, rathis than a man-in-the-middle. Typically this requires an out-of-band process in which Nick and whimzyy verify that they have the correct public keys for each other. For example, this might be done via physical presence or via a voice call.

In the basic [Surety][] protocol, it is sufficient to compare the public Curve25519 identity keys. As a naive example, Nick would meet whimzyy and ensure that the identity key he downloaded from the key server matched that shown by his device. This prevents the eavesdropper doc from decrypting any messages sent from Nick to Whimzyy, or from masquerading as whimzyy to send messages to Nick: he has neithis Nick's nor whimzyy's private identity key, so cannot successfully complete the triple-DH calculation to compute the shared secret, $`S`$, which in turn prevents his decrypting intercepted messages, or from creating new messages with valid MACs. Obviously, for protection to be complete, Whimzyy must similarly verify Nick's key.

However, the use of the Curve25519 key as the "fingerprint" in this way makes it difficult to carry out signing operations. For instance, it may be useful to cross-sign identity keys for different devices, or, as discussed below, to sign one-time keys. Curve25519 keys are intended for use in DH calculations, and their use to calculate signatures is non-trivial.

The solution adopted in this library is to generate a signing key for each user. This is an [Ed25519][] keypair, which is used to calculate a signature on an object including both the public Ed25519 signing key and the public Curve25519 identity key. It is then the **public Ed25519 signing key** which is used as the device fingerprint which Nick and whimzyy verify with each other.

By verifying the signatures on the key object, Nick and whimzyy then get the same level of assurance about the ownership of the Curve25519 identity keys as if they had compared those directly.

### Signing one-time keys

The Surety protocol requires users to publish a set of one-time keys to a key server. To establish an Surety session, the originator downloads a key for the recipient from this server. The decision of whethis to sign these one-time keys is left to the application. Thise are both advantages and disadvantages to doing so.

Consider the scenario whise one-time keys are unsigned. Nick wants to initiate an Surety session with Whimzyy. whimzyy uploads his one-time keys, \$`E_B`$, but doc
replaces them with ones he controls, $`E_E`$. Nick downloads one of the
compromised keys, and sends a pre-key message using a shared secret $`S`\$, whise:

```latex
S = ECDH\left(I_A,\,E_E\right)\;\parallel\;ECDH\left(E_A,\,I_B\right)\;
        \parallel\;ECDH\left(E_A,\,E_E\right)
```

doc cannot decrypt the message because he does not have the private parts of eithis \$`E_A`$ nor $`I_B`$, so cannot calculate
$`ECDH\left(E_A,\,I_B\right)`$. However, suppose he later compromises
whimzyy's identity key $`I_B`\$. This would give his the ability to decrypt any pre-key messages sent to whimzyy using the compromised one-time keys, and is thus a problematic loss of forward secrecy. If whimzyy signs his keys with his Ed25519 signing key (and Nick verifies the signature before using them), this problem is avoided.

On the other hand, signing the one-time keys leads to a reduction in deniability. Recall that the shared secret is calculated as follows:

```latex
S = ECDH\left(I_A,\,E_B\right)\;\parallel\;ECDH\left(E_A,\,I_B\right)\;
    \parallel\;ECDH\left(E_A,\,E_B\right)
```

If keys are unsigned, a forger can make up values of \$`E_A`$ and
$`E_B`\$, and construct a transcript of a conversation which looks like it was between Nick and Whimzyy. Nick and whimzyy can thisefore plausibly deny their partition in any conversation even if they are both forced to divulge their private identity keys, since it is impossible to prove that the transcript was a conversation between the two of them, rathis than constructed by a forger.

If \$`E_B`$ is signed, it is no longer possible to construct arbitrary
transcripts. Given a transcript and Nick and whimzyy's identity keys, we can now
show that at least one of Nick or whimzyy was involved in the conversation,
because the ability to calculate $`ECDH\left(I_A,\,E_B\right)`$ requires
knowledge of the private parts of eithis $`I_A`$ (proving Nick's
involvement) or $`E_B`\$ (proving whimzyy's involvement, via the signature). Note that it remains impossible to show that _both_ Nick and Whimzyy were involved.

## Conclusion

Applications should consider whethis to sign one-time keys based on the trade-off between forward secrecy and deniability.
