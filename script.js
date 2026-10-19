const STORAGE_KEY = "helpdesk_portal_tickets_v1";
const seedTickets = [
 {id:"HD-1048",requester:"Aarav Sharma",email:"aarav@example.com",title:"Laptop won't connect to Wi-Fi",category:"Network",priority:"High",status:"Open",description:"Laptop is unable to connect to the office Wi-Fi network.",created:daysAgo(0)},
 {id:"HD-1047",requester:"Meera Singh",email:"meera@example.com",title:"Install design software",category:"Software",priority:"Medium",status:"In Progress",description:"Need approved design software installed for a project.",created:daysAgo(1)},
 {id:"HD-1046",requester:"Rohan Verma",email:"rohan@example.com",title:"Keyboard keys not responding",category:"Hardware",priority:"Low",status:"Resolved",description:"Some keys were not responding. External keyboard was tested.",created:daysAgo(2)},
 {id:"HD-1045",requester:"Ananya Gupta",email:"ananya@example.com",title:"Unable to access email account",category:"Account Access",priority:"Critical",status:"Open",description:"Unable to sign in to work email after password reset.",created:daysAgo(2)},
 {id:"HD-1044",requester:"Kabir Joshi",email:"kabir@example.com",title:"Application closes on launch",category:"Software",priority:"Medium",status:"In Progress",description:"Application closes immediately after opening.",created:daysAgo(3)}
];
function daysAgo(n){const d=new Date();d.setDate(d.getDate()-n);return d.toISOString();}
let tickets = loadTickets();
function loadTickets(){try{const stored=localStorage.getItem(STORAGE_KEY);return stored?JSON.parse(stored):seedTickets;}catch{return seedTickets;}}
function saveTickets(){localStorage.setItem(STORAGE_KEY,JSON.stringify(tickets));}
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const initials = name => name.split(/\s+/).slice(0,2).map(x=>x[0]||"").join("").toUpperCase();
const shortDate = value => new Date(value).toLocaleDateString("en-IN",{day:"2-digit",month:"short"});
const dateLong = value => new Date(value).toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"});
const statusClass = s => s==="Open"?"status-open":s==="In Progress"?"status-progress":"status-resolved";
const priorityClass = p => "priority-"+p.toLowerCase();
function statusPill(s){return `<span class="pill ${statusClass(s)}">${esc(s)}</span>`;}
function priorityText(p){return `<strong class="${priorityClass(p)}">${esc(p)}</strong>`;}
function render(){
 const total=tickets.length, open=tickets.filter(t=>t.status==="Open").length, progress=tickets.filter(t=>t.status==="In Progress").length, resolved=tickets.filter(t=>t.status==="Resolved").length;
 $("#totalStat").textContent=total;$("#openStat").textContent=open;$("#progressStat").textContent=progress;$("#resolvedStat").textContent=resolved;$("#navTicketCount").textContent=total;
 $("#donutTotal").textContent=total;$("#legendOpen").textContent=open;$("#legendProgress").textContent=progress;$("#legendResolved").textContent=resolved;
 const a=total?open/total*360:0,b=total?progress/total*360:0;
 $("#donutChart").style.background=`conic-gradient(#6558e8 0deg ${a}deg,#4288e8 ${a}deg ${a+b}deg,#28b587 ${a+b}deg 360deg)`;
 $("#hardwareCount").textContent=tickets.filter(t=>t.category==="Hardware").length;
 $("#softwareCount").textContent=tickets.filter(t=>t.category==="Software").length;
 $("#networkCount").textContent=tickets.filter(t=>t.category==="Network").length;
 $("#accountCount").textContent=tickets.filter(t=>t.category==="Account Access").length;
 const recent=[...tickets].sort((a,b)=>new Date(b.created)-new Date(a.created)).slice(0,5);
 $("#recentTickets").innerHTML=recent.map(t=>`<tr><td><span class="ticket-id">${esc(t.id)}</span><span class="ticket-title" title="${esc(t.title)}">${esc(t.title)}</span></td><td><div class="requester"><span class="mini-avatar">${esc(initials(t.requester))}</span><span class="requester-name">${esc(t.requester)}</span></div></td><td>${esc(t.category)}</td><td>${priorityText(t.priority)}</td><td>${statusPill(t.status)}</td></tr>`).join("");
 $("#recentEmpty").classList.toggle("hidden",total!==0);
 renderAllTickets();
}
function renderAllTickets(){
 const query=$("#searchInput").value.trim().toLowerCase(),status=$("#statusFilter").value,category=$("#categoryFilter").value;
 const filtered=[...tickets].sort((a,b)=>new Date(b.created)-new Date(a.created)).filter(t=>(status==="All"||t.status===status)&&(category==="All"||t.category===category)&&[t.id,t.title,t.requester,t.email,t.description,t.category].some(x=>x.toLowerCase().includes(query)));
 $("#allTickets").innerHTML=filtered.map(t=>`<tr><td><span class="ticket-id">${esc(t.id)}</span><span class="ticket-title" title="${esc(t.title)}">${esc(t.title)}</span></td><td><div class="requester"><span class="mini-avatar">${esc(initials(t.requester))}</span><div><div class="requester-name">${esc(t.requester)}</div><div class="requester-email">${esc(t.email)}</div></div></div></td><td>${esc(t.category)}</td><td>${priorityText(t.priority)}</td><td><select class="action-select" data-status-id="${esc(t.id)}" aria-label="Change status for ${esc(t.id)}"><option ${t.status==="Open"?"selected":""}>Open</option><option ${t.status==="In Progress"?"selected":""}>In Progress</option><option ${t.status==="Resolved"?"selected":""}>Resolved</option></select></td><td>${shortDate(t.created)}</td><td><button class="text-button delete-ticket" data-delete-id="${esc(t.id)}" aria-label="Delete ${esc(t.id)}">Delete</button></td></tr>`).join("");
 $("#allEmpty").classList.toggle("hidden",filtered.length!==0);
 $("#tableFooter").textContent=`Showing ${filtered.length} of ${tickets.length} ticket${tickets.length===1?"":"s"}`;
}
function showToast(message){const toast=$("#toast");toast.textContent=message;toast.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove("show"),2600);}
function navigate(view){
 $$(".view").forEach(v=>v.classList.remove("active-view"));$("#"+view+"View").classList.add("active-view");
 $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
 $("#breadcrumbCurrent").textContent=({dashboard:"Dashboard",tickets:"All tickets",knowledge:"Quick guides"})[view];
}
function openModal(category="Hardware"){ $("#ticketForm").reset();$("#newCategory").value=category;$("#ticketModal").classList.remove("hidden");document.body.style.overflow="hidden";setTimeout(()=>$("#ticketForm [name=requester]").focus(),50);}
function closeModal(){$("#ticketModal").classList.add("hidden");document.body.style.overflow="";}
function nextId(){const max=tickets.reduce((m,t)=>Math.max(m,Number(t.id.replace("HD-",""))||0),1043);return "HD-"+(max+1);}
$$(".nav-item").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.view)));
$("#newTicketTop").addEventListener("click",()=>openModal());
$("#newTicketList").addEventListener("click",()=>openModal());
$("#emptyNewTicket").addEventListener("click",()=>openModal());
$("#viewAll").addEventListener("click",()=>navigate("tickets"));
$("#openGuides").addEventListener("click",()=>navigate("knowledge"));
$("#closeModal").addEventListener("click",closeModal);$("#cancelModal").addEventListener("click",closeModal);
$("#ticketModal").addEventListener("click",e=>{if(e.target.id==="ticketModal")closeModal();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
$("#ticketForm").addEventListener("submit",e=>{
 e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget).entries());
 const ticket={id:nextId(),requester:data.requester.trim(),email:data.email.trim(),title:data.title.trim(),category:data.category,priority:data.priority,status:"Open",description:data.description.trim(),created:new Date().toISOString()};
 tickets.push(ticket);saveTickets();render();closeModal();navigate("tickets");showToast(`${ticket.id} created successfully.`);
});
["searchInput","statusFilter","categoryFilter"].forEach(id=>$("#"+id).addEventListener(id==="searchInput"?"input":"change",renderAllTickets));
$("#allTickets").addEventListener("change",e=>{
 const id=e.target.dataset.statusId;if(!id)return;const t=tickets.find(x=>x.id===id);if(!t)return;t.status=e.target.value;saveTickets();render();showToast(`${id} status updated to ${t.status}.`);
});
$("#allTickets").addEventListener("click",e=>{
 const button=e.target.closest("[data-delete-id]");if(!button)return;const id=button.dataset.deleteId;if(!confirm(`Delete ticket ${id}? This cannot be undone.`))return;tickets=tickets.filter(t=>t.id!==id);saveTickets();render();showToast(`${id} deleted.`);
});
$$(".guide-ticket").forEach(b=>b.addEventListener("click",()=>openModal(b.dataset.category)));
$("#themeToggle").addEventListener("click",()=>{document.body.classList.toggle("dark");localStorage.setItem("helpdesk_dark",document.body.classList.contains("dark")?"1":"0");});
if(localStorage.getItem("helpdesk_dark")==="1")document.body.classList.add("dark");
$("#todayLabel").textContent=dateLong(new Date());
render();
