function toggleDisplay(id)	{
	if (!document.getElementById) {	return;	}
	var el = document.getElementById(id);
	if (el.style.display == '') {
		el.style.display = 'none';
	}
	else {
		el.style.display = '';
	}
}

function putFocus(){
  document.getElementById('loginForm:j_username').focus();
}

function checkAll(field) {
	for (i = 0; i < field.length; i++)
		field[i].checked = true ;
}

function uncheckAll(field) {
	for (i = 0; i < field.length; i++)
		field[i].checked = false ;
}

function addOnclickToDatatableRows() {
    var trs = document.getElementById('korisniciForm:tabelaKorisnici').getElementsByTagName('tbody')[0]
        .getElementsByTagName('tr');
    for (var i = 0; i < trs.length; i++) {
        trs[i].onclick = new Function("highlightAndSelectRow(this)");
    }
}

function highlightAndSelectRow(tr) {
    var trs = document.getElementById('korisniciForm:tabelaKorisnici').getElementsByTagName('tbody')[0]
        .getElementsByTagName('tr');
    for (var i = 0; i < trs.length; i++) {
        if (trs[i] == tr) {
            trs[i].bgColor = '#ff0000';
            document.form.rowIndex.value = trs[i].rowIndex;
        } else {
            trs[i].bgColor = '#ffffff';
        }
    }
}

