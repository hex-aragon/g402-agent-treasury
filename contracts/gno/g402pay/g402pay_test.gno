package g402pay

import "testing"

func TestInitialState(t *testing.T) {
	if PaymentCount() != 0 {
		t.Fatalf("expected empty payment registry")
	}
	if HasPayment("pay_not_recorded_0001") {
		t.Fatalf("unexpected payment")
	}
}
