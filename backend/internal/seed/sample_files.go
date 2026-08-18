package seed

// SampleCSVData returns realistic CSV bytes representing order transactions.
func SampleCSVData() []byte {
	return []byte(`type,number,customer,product,qty,price,status
order,ORD-B2B-1001,Bharat Heavy Electricals,Heavy Industrial Valve,120,4500,completed
order,ORD-B2B-1002,Larsen & Toubro Ltd,High Pressure Turbine Casing,45,35000,processing
po,PO-STEEL-2001,Jindal Steel & Power,Structural Beams ISMB 400,300,6200,approved
invoice,INV-B2B-9001,Bharat Heavy Electricals,Heavy Industrial Valve,100,4500,issued
`)
}

// SampleTSVData returns realistic TSV bytes representing supplier invoices.
func SampleTSVData() []byte {
	return []byte("type\tnumber\tsupplier\tproduct\tqty\tprice\tstatus\n" +
		"po\tPO-RAW-501\tHindalco Industries Ltd\tAluminium Ingots Grade A\t500\t2200\tconfirmed\n" +
		"invoice\tINV-RAW-501\tHindalco Industries Ltd\tAluminium Ingots Grade A\t500\t2450\tpaid\n")
}

// SampleEmailData returns raw RFC 822 email bytes representing an invoice delivery.
func SampleEmailData() []byte {
	return []byte(`From: billing@tatasteel.com
To: accounts@apexcastings.in
Subject: Invoice INV-TATA-7890 for Purchase Order PO-TATA-9001
Date: Mon, 17 Aug 2026 10:30:00 +0530

Dear Accounts Team,

Please find attached the official tax invoice INV-TATA-7890 for 500 units of Seamless Steel Pipes.
Total Amount: INR 24,25,000.00.

Regards,
Tata Steel Billing Dept
`)
}
