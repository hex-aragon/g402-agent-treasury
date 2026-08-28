package g402pay

import (
	"chain"
	"chain/banker"
	"chain/runtime"
	"gno.land/p/nt/avl/v0"
	"strconv"
)

type Payment struct {
	Payer        address
	Recipient    address
	Amount       int64
	ResourceHash string
	Nonce        string
}

var (
	payments avl.Tree
	count    int64
)

// Pay accepts an exact direct-EoA ugnot payment, forwards it atomically to the
// merchant, and records an immutable x402 receipt keyed by paymentID.
func Pay(_ realm, paymentID string, recipient address, amount int64, resourceHash, nonce string) {
	caller := runtime.PreviousRealm()
	if !caller.IsUserCall() {
		panic("g402pay: direct user call required")
	}
	if runtime.OriginCaller() != caller.Address() {
		panic("g402pay: origin mismatch")
	}
	if len(paymentID) < 16 || len(paymentID) > 128 || len(nonce) < 16 || len(nonce) > 128 {
		panic("g402pay: invalid identifier")
	}
	if len(resourceHash) != 64 || amount <= 0 {
		panic("g402pay: invalid terms")
	}
	if payments.Has(paymentID) {
		panic("g402pay: duplicate payment")
	}

	sent := banker.OriginSend()
	if sent.AmountOf("ugnot") != amount {
		panic("g402pay: exact ugnot amount required")
	}

	realmAddress := runtime.CurrentRealm().Address()
	realmBanker := banker.NewBanker(banker.BankerTypeRealmSend)
	realmBanker.SendCoins(realmAddress, recipient, chain.Coins{{"ugnot", amount}})

	receipt := Payment{runtime.OriginCaller(), recipient, amount, resourceHash, nonce}
	payments.Set(paymentID, receipt)
	count++
	chain.Emit("G402Payment",
		"payment_id", paymentID,
		"payer", receipt.Payer.String(),
		"recipient", recipient.String(),
		"amount", strconv.FormatInt(amount, 10),
		"denom", "ugnot",
		"resource_hash", resourceHash,
		"nonce", nonce,
	)
}

func HasPayment(paymentID string) bool {
	return payments.Has(paymentID)
}

func GetPayment(paymentID string) (string, string, int64, string, string, bool) {
	raw := payments.Get(paymentID)
	if raw == nil {
		return "", "", 0, "", "", false
	}
	receipt := raw.(Payment)
	return receipt.Payer.String(), receipt.Recipient.String(), receipt.Amount, receipt.ResourceHash, receipt.Nonce, true
}

func PaymentCount() int64 {
	return count
}

func Render(_ string) string {
	return "# g402pay\n\nAtomic native GNOT x402 payment forwarding and immutable on-chain receipts."
}
