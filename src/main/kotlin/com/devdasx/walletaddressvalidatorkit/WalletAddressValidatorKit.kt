package com.devdasx.walletaddressvalidatorkit

import java.math.BigInteger
import java.security.MessageDigest

data class AddressValidationResult(
    val valid: Boolean,
    val chain: String,
    val format: String? = null,
    val type: String? = null,
    val reason: String? = null,
)

object WalletAddressValidatorKit {
    private const val alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
    private val evmChains = setOf("ethereum", "polygon", "bsc", "avalanche-c", "arbitrum", "optimism", "base")
    private val prefixes = mapOf(
        "bitcoin" to listOf(byteArrayOf(0x00) to "p2pkh", byteArrayOf(0x05) to "p2sh"),
        "litecoin" to listOf(byteArrayOf(0x30) to "p2pkh", byteArrayOf(0x32) to "p2sh", byteArrayOf(0x05) to "legacy-p2sh"),
        "dogecoin" to listOf(byteArrayOf(0x1e) to "p2pkh", byteArrayOf(0x16) to "p2sh"),
        "dash" to listOf(byteArrayOf(0x4c) to "p2pkh", byteArrayOf(0x10) to "p2sh"),
        "digibyte" to listOf(byteArrayOf(0x1e) to "p2pkh", byteArrayOf(0x3f) to "p2sh"),
        "tron" to listOf(byteArrayOf(0x41) to "account"),
        "zcash" to listOf(byteArrayOf(0x1c, 0xb8.toByte()) to "transparent-p2pkh", byteArrayOf(0x1c, 0xbd.toByte()) to "transparent-p2sh"),
    )

    fun validateAddress(value: String, chain: String): AddressValidationResult {
        val text = value.trim()
        val chainId = chain.lowercase()
        fun fail(reason: String) = AddressValidationResult(false, chainId, reason = reason)
        if (text.isEmpty()) return fail("address is empty")

        if (chainId in evmChains) {
            val body = if (text.startsWith("0x", true)) text.drop(2) else text
            return if (body.length == 40 && body.all { it.isDigit() || it.lowercaseChar() in 'a'..'f' }) {
                AddressValidationResult(true, chainId, "evm-hex", "account")
            } else fail("invalid EVM address")
        }

        if (chainId == "solana") {
            val decoded = base58Decode(text)
            return if (decoded != null && decoded.size == 32) {
                AddressValidationResult(true, chainId, "solana-base58", "account-or-pda")
            } else fail("invalid Solana address")
        }

        val payload = base58Check(text)
        for ((prefix, type) in prefixes[chainId].orEmpty()) {
            if (payload != null && payload.size == prefix.size + 20 && payload.take(prefix.size).toByteArray().contentEquals(prefix)) {
                return AddressValidationResult(true, chainId, "base58check", type)
            }
        }

        return fail("address did not match supported validators")
    }

    private fun base58Decode(value: String): ByteArray? {
        var number = BigInteger.ZERO
        val radix = BigInteger.valueOf(58)
        for (char in value) {
            val digit = alphabet.indexOf(char)
            if (digit < 0) return null
            number = number.multiply(radix).add(BigInteger.valueOf(digit.toLong()))
        }
        val raw = number.toByteArray().dropWhile { it == 0.toByte() }.toByteArray()
        val zeros = value.takeWhile { it == '1' }.length
        return ByteArray(zeros) + raw
    }

    private fun base58Check(value: String): ByteArray? {
        val raw = base58Decode(value) ?: return null
        if (raw.size < 5) return null
        val payload = raw.copyOfRange(0, raw.size - 4)
        val checksum = raw.copyOfRange(raw.size - 4, raw.size)
        val first = MessageDigest.getInstance("SHA-256").digest(payload)
        val second = MessageDigest.getInstance("SHA-256").digest(first)
        return if (second.copyOfRange(0, 4).contentEquals(checksum)) payload else null
    }
}
