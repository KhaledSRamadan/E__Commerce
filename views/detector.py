from scapy.all import *
import os
from subprocess import *

ip = get_if_addr(conf.iface)
print(f'Local IP = {ip}')
banned = []
type = input('''
1 to defend against TCP attacks
2 to defend against UDP attacks
3 to defend against ICMP attacks
''')
if(type=='1'):
    type='tcp'
elif type=='2':
    type='udp'
elif type == '3':
    type='icmp'
else:
    exit()

while(True):
    srcIP = {}
    pkts = sniff(iface = 'enp0s3',filter = type,timeout =10)

    for packet in pkts:
        if (packet.haslayer(IP) and packet.getlayer(IP).src not in banned):
            if packet.getlayer(IP).src in srcIP :
                srcIP[packet.getlayer(IP).src]+=1
            else :
                srcIP[packet.getlayer(IP).src]=1
            if srcIP[packet.getlayer(IP).src]>9 and packet.getlayer(IP).src != ip and packet.getlayer(IP).src not in banned:
                print(f"BANNED : {packet.getlayer(IP).src}")
                banned.append(packet.getlayer(IP).src)
                cmd = 'iptables -A INPUT -s '+packet.getlayer(IP).src+' -p '+type+' -j DROP'
                os.popen(cmd)
                cmd = 'iptables-save'
                os.popen(cmd)
                cmd=''
                srcIP[packet.getlayer(IP).src] = 0
