
'use client';
import { useEffect } from 'react';

const TawkMessenger = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (document.getElementById('tawkto-script')) return; // prevent multiple loads

    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = 'https://embed.tawk.to/689dd15cdfe9e71926fd390b/1j2k7jksk'; // <-- Your Widget Link
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s1.id = 'tawkto-script';
    document.body.appendChild(s1);

    return () => {
      const existingScript = document.getElementById('tawkto-script');
      if (existingScript) existingScript.remove();
    };
  }, []);

  return null;
};

export default TawkMessenger;


// <!--Start of Tawk.to Script-->
// <script type="text/javascript">
// var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
// (function(){
// var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
// s1.async=true;
// s1.src='https://embed.tawk.to/68917fcdb40fb6192870b3b3/1j1s5mfl5';
// s1.charset='UTF-8';
// s1.setAttribute('crossorigin','*');
// s0.parentNode.insertBefore(s1,s0);
// })();
// </script>
// <!--End of Tawk.to Script-->